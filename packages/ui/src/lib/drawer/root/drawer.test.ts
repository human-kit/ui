import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import DrawerTest from './drawer-test.svelte';

/** Portalled content survives unmount in this environment; clear it between tests. */
afterEach(() => {
	document.querySelectorAll('[data-drawer-content]').forEach((node) => node.remove());
	document.querySelectorAll('[data-drawer-overlay]').forEach((node) => node.remove());
	document.querySelectorAll('[data-drawer-viewport]').forEach((node) => node.remove());
});

function panel(): HTMLElement | null {
	return document.querySelector<HTMLElement>('[data-drawer-content]');
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

let nextPointerId = 100;

/**
 * Drives a real pointer drag on `target`.
 *
 * The moves are spaced in real time on purpose: dispatched back to back they all
 * share a timestamp, which the velocity sampler correctly reads as an infinitely
 * fast flick — and every drag would dismiss.
 */
async function drag(
	target: Element,
	from: { x: number; y: number },
	steps: Array<{ x: number; y: number }>,
	options: { stepDelay?: number; release?: boolean } = {}
) {
	const pointerId = nextPointerId++;
	const stepDelay = options.stepDelay ?? 25;
	const base = { bubbles: true, pointerId, pointerType: 'touch' as const, isPrimary: true };

	target.dispatchEvent(
		new PointerEvent('pointerdown', { ...base, button: 0, clientX: from.x, clientY: from.y })
	);

	let last = from;
	for (const step of steps) {
		await wait(stepDelay);
		window.dispatchEvent(
			new PointerEvent('pointermove', { ...base, clientX: step.x, clientY: step.y })
		);
		last = step;
	}

	if (options.release !== false) {
		window.dispatchEvent(
			new PointerEvent('pointerup', { ...base, clientX: last.x, clientY: last.y })
		);
	}

	return { pointerId, last };
}

describe('Drawer', () => {
	describe('Visibility', () => {
		it('is closed by default', () => {
			render(DrawerTest);
			expect(panel()).toBeNull();
		});

		it('opens from the trigger', async () => {
			const screen = render(DrawerTest);
			await screen.getByRole('button', { name: 'Open Drawer' }).click();
			await expect.poll(panel).toBeTruthy();
		});

		it('closes on Escape', async () => {
			const screen = render(DrawerTest);
			await screen.getByRole('button', { name: 'Open Drawer' }).click();
			await expect.poll(panel).toBeTruthy();

			await userEvent.keyboard('{Escape}');
			await expect.poll(panel).toBeNull();
		});

		it('stays open on Escape with shouldCloseOnEscape=false', async () => {
			const screen = render(DrawerTest, { shouldCloseOnEscape: false });
			await screen.getByRole('button', { name: 'Open Drawer' }).click();
			await expect.poll(panel).toBeTruthy();

			await userEvent.keyboard('{Escape}');
			await wait(50);
			expect(panel()).toBeTruthy();
		});

		it('closes from Drawer.Close', async () => {
			const screen = render(DrawerTest);
			await screen.getByRole('button', { name: 'Open Drawer' }).click();
			await expect.poll(panel).toBeTruthy();

			const close = document.querySelector<HTMLButtonElement>('[data-drawer-close]');
			close?.click();
			await expect.poll(panel).toBeNull();
		});

		it('renders open when defaultOpen is set', async () => {
			render(DrawerTest, { defaultOpen: true });
			await expect.poll(panel).toBeTruthy();
		});
	});

	describe('Accessibility', () => {
		it('is a modal dialog named by its title and described by its description', async () => {
			const screen = render(DrawerTest, { defaultOpen: true });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			expect(content.getAttribute('role')).toBe('dialog');
			expect(content.getAttribute('aria-modal')).toBe('true');

			const labelId = content.getAttribute('aria-labelledby');
			expect(labelId).toBeTruthy();
			expect(document.getElementById(labelId!)?.textContent).toBe('Drawer Title');

			const describedId = content.getAttribute('aria-describedby');
			expect(describedId).toBeTruthy();
			expect(document.getElementById(describedId!)?.textContent).toBe('Drawer description text.');

			// The accessible name has to resolve through the query, not just the attribute.
			await expect
				.element(screen.getByRole('dialog', { name: 'Drawer Title' }))
				.toBeInTheDocument();
		});

		it('renders the title as a heading', async () => {
			render(DrawerTest, { defaultOpen: true });
			await expect.poll(panel).toBeTruthy();
			expect(document.querySelector('[data-drawer-title]')?.tagName).toBe('H2');
		});

		it('drops aria-modal when modal is false', async () => {
			render(DrawerTest, { defaultOpen: true, modal: false });
			await expect.poll(panel).toBeTruthy();
			expect(panel()!.hasAttribute('aria-modal')).toBe(false);
		});

		it('leaves the page alone when modal is false', async () => {
			render(DrawerTest, { defaultOpen: true, modal: false });
			await expect.poll(panel).toBeTruthy();

			// The whole point of a non-modal drawer: the page stays scrollable and
			// stays readable to assistive technology.
			expect(document.body.style.position).not.toBe('fixed');
			expect(document.body.style.overflow).not.toBe('hidden');

			// Nothing OUTSIDE the panel is hidden. Counting every `aria-hidden` would
			// also catch the drawer's own decorative parts, which are meant to be.
			const hiddenOutside = [...document.querySelectorAll('[aria-hidden="true"]')].filter(
				(node) => !panel()!.contains(node)
			);
			expect(hiddenOutside).toHaveLength(0);
		});

		it('moves focus into the panel on open and back to the trigger on close', async () => {
			const screen = render(DrawerTest);
			const trigger = screen.getByRole('button', { name: 'Open Drawer' });
			await trigger.click();
			await expect.poll(panel).toBeTruthy();

			await expect.poll(() => panel()!.contains(document.activeElement)).toBe(true);

			await userEvent.keyboard('{Escape}');
			await expect.poll(panel).toBeNull();
			await expect
				.poll(() => (document.activeElement as HTMLElement | null)?.textContent?.trim())
				.toBe('Open Drawer');
		});

		it('marks the first frame so the enter transition has somewhere to start', async () => {
			const screen = render(DrawerTest);

			// The attribute lives for two frames by design, so it has to be caught as the
			// nodes are inserted. Polling for it races the very timer that clears it, and
			// under load the poll loses.
			const seen: Record<string, boolean> = {};
			const observer = new MutationObserver(() => {
				for (const selector of ['[data-drawer-content]', '[data-drawer-overlay]']) {
					if (selector in seen) continue;
					const element = document.querySelector(selector);
					if (element) seen[selector] = element.hasAttribute('data-starting-style');
				}
			});
			observer.observe(document.body, { childList: true, subtree: true });

			await screen.getByRole('button', { name: 'Open Drawer' }).click();
			await expect.poll(panel).toBeTruthy();
			observer.disconnect();

			// A node inserted straight into its final position has nothing to transition
			// from, and simply pops open.
			expect(seen['[data-drawer-content]']).toBe(true);
			expect(seen['[data-drawer-overlay]']).toBe(true);

			// And gone a couple of frames later, which is what lets the transition run.
			await expect.poll(() => panel()!.hasAttribute('data-starting-style')).toBe(false);
		});

		it('exposes the anchored side', async () => {
			render(DrawerTest, { defaultOpen: true, side: 'left' });
			await expect.poll(panel).toBeTruthy();
			expect(panel()!.getAttribute('data-side')).toBe('left');
		});
	});

	describe('Controlled state', () => {
		it('reports every change through onOpenChange', async () => {
			const onOpenChange = vi.fn();
			const screen = render(DrawerTest, { onOpenChange });

			await screen.getByRole('button', { name: 'Open Drawer' }).click();
			expect(onOpenChange).toHaveBeenCalledWith(true);

			await userEvent.keyboard('{Escape}');
			await expect.poll(panel).toBeNull();
			expect(onOpenChange).toHaveBeenCalledWith(false);
		});

		it('lets a controlled parent reject a close', async () => {
			const onOpenChange = vi.fn();
			// `open` stays true and is never flowed back down: the drawer must not
			// close itself.
			render(DrawerTest, { open: true, controlledOpen: true, onOpenChange });
			await expect.poll(panel).toBeTruthy();

			await userEvent.keyboard('{Escape}');
			await wait(50);
			expect(onOpenChange).toHaveBeenCalledWith(false);
			expect(panel()).toBeTruthy();
		});
	});

	describe('Swipe to dismiss', () => {
		it('dismisses when dragged past half the panel', async () => {
			render(DrawerTest, { defaultOpen: true });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			await drag(content, { x: start.left + 20, y: start.top + 10 }, [
				{ x: start.left + 20, y: start.top + 60 },
				{ x: start.left + 20, y: start.top + 120 },
				{ x: start.left + 20, y: start.top + 170 }
			]);

			await expect.poll(panel).toBeNull();
		});

		it('springs back after a short, slow drag', async () => {
			render(DrawerTest, { defaultOpen: true });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			await drag(
				content,
				{ x: start.left + 20, y: start.top + 10 },
				[
					{ x: start.left + 20, y: start.top + 16 },
					{ x: start.left + 20, y: start.top + 22 }
				],
				{ stepDelay: 60 }
			);

			await wait(50);
			expect(panel()).toBeTruthy();
			expect(panel()!.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px');
		});

		it('tracks the finger while dragging', async () => {
			render(DrawerTest, { defaultOpen: true });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			await drag(
				content,
				{ x: start.left + 20, y: start.top + 10 },
				[{ x: start.left + 20, y: start.top + 50 }],
				{ release: false }
			);

			expect(content.getAttribute('data-swiping')).toBe('true');
			expect(content.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('40px');
			// 40px of a 200px panel.
			expect(content.style.getPropertyValue('--drawer-swipe-progress')).toBe('0.2');

			window.dispatchEvent(
				new PointerEvent('pointerup', { bubbles: true, pointerId: nextPointerId - 1 })
			);
		});

		it('stays put when the drag is mostly across the axis', async () => {
			render(DrawerTest, { defaultOpen: true });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			await drag(content, { x: start.left + 20, y: start.top + 10 }, [
				{ x: start.left + 140, y: start.top + 30 },
				{ x: start.left + 240, y: start.top + 40 }
			]);

			await wait(50);
			expect(panel()).toBeTruthy();
		});

		it('leaves the drag to a scrolled body', async () => {
			render(DrawerTest, { defaultOpen: true, scrollableBody: true });
			await expect.poll(panel).toBeTruthy();

			const body = document.querySelector<HTMLElement>('[data-drawer-body]')!;
			body.scrollTop = 100;

			const rect = body.getBoundingClientRect();
			await drag(body, { x: rect.left + 20, y: rect.top + 10 }, [
				{ x: rect.left + 20, y: rect.top + 60 },
				{ x: rect.left + 20, y: rect.top + 160 },
				{ x: rect.left + 20, y: rect.top + 260 }
			]);

			// The body could still scroll up, so the gesture was never the drawer's.
			await wait(50);
			expect(panel()).toBeTruthy();
		});

		it('never drags from the body, even scrolled to the top and with a finger', async () => {
			render(DrawerTest, { defaultOpen: true, scrollableBody: true });
			await expect.poll(panel).toBeTruthy();

			const body = document.querySelector<HTMLElement>('[data-drawer-body]')!;
			expect(body.scrollTop).toBe(0);

			const rect = body.getBoundingClientRect();
			await drag(body, { x: rect.left + 20, y: rect.top + 5 }, [
				{ x: rect.left + 20, y: rect.top + 60 },
				{ x: rect.left + 20, y: rect.top + 130 },
				{ x: rect.left + 20, y: rect.top + 190 }
			]);

			// The body is content, not a handle — and "cannot be dragged" has to mean
			// nothing moves at all, not that it moves a little and springs back.
			await wait(50);
			expect(panel()).toBeTruthy();
			expect(panel()!.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('0px');
			expect(panel()!.style.getPropertyValue('--drawer-overdrag')).toBe('0px');
			expect(panel()!.hasAttribute('data-swiping')).toBe(false);
		});

		it('still drags from the panel around the body', async () => {
			render(DrawerTest, { defaultOpen: true, scrollableBody: true });
			await expect.poll(panel).toBeTruthy();

			// The title sits outside Drawer.Body, so it is part of the handle.
			const title = document.querySelector<HTMLElement>('[data-drawer-title]')!;
			const rect = title.getBoundingClientRect();
			await drag(title, { x: rect.left + 10, y: rect.top + 5 }, [
				{ x: rect.left + 10, y: rect.top + 60 },
				{ x: rect.left + 10, y: rect.top + 130 },
				{ x: rect.left + 10, y: rect.top + 190 }
			]);

			await expect.poll(panel).toBeNull();
		});

		it('stretches against a pull past fully open, without uncovering the page', async () => {
			render(DrawerTest, { defaultOpen: true });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			// Upward on a bottom drawer: further open than there is anywhere to go.
			await drag(
				content,
				{ x: start.left + 20, y: start.top + 120 },
				[
					{ x: start.left + 20, y: start.top + 60 },
					{ x: start.left + 20, y: start.top - 40 }
				],
				{ release: false }
			);

			// The panel gives, but nowhere near the 160px the finger travelled.
			const movement = Number.parseFloat(
				content.style.getPropertyValue('--drawer-swipe-movement-y')
			);
			expect(movement).toBeLessThan(0);
			expect(movement).toBeGreaterThan(-40);

			const overdrag = Number.parseFloat(content.style.getPropertyValue('--drawer-overdrag'));
			expect(overdrag).toBeCloseTo(-movement, 5);

			// The strip of page the panel just moved off is covered by its own background,
			// or the drawer reads as coming apart from its edge.
			const bleed = content.querySelector<HTMLElement>('[data-drawer-bleed]');
			expect(bleed).toBeTruthy();
			expect(Number.parseFloat(bleed!.style.height)).toBeGreaterThanOrEqual(overdrag);

			window.dispatchEvent(
				new PointerEvent('pointerup', {
					bubbles: true,
					pointerId: nextPointerId - 1,
					clientX: start.left + 20,
					clientY: start.top - 40
				})
			);
			await wait(50);
			expect(panel()).toBeTruthy();
			expect(panel()!.style.getPropertyValue('--drawer-overdrag')).toBe('0px');
		});

		it('resists instead of dismissing when dismissible is false', async () => {
			render(DrawerTest, { defaultOpen: true, dismissible: false });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			await drag(
				content,
				{ x: start.left + 20, y: start.top + 10 },
				[
					{ x: start.left + 20, y: start.top + 60 },
					{ x: start.left + 20, y: start.top + 150 }
				],
				{ release: false }
			);

			const movement = Number.parseFloat(
				content.style.getPropertyValue('--drawer-swipe-movement-y')
			);
			// Followed the finger, but well short of the 140px it actually travelled.
			expect(movement).toBeGreaterThan(0);
			expect(movement).toBeLessThan(140);

			window.dispatchEvent(
				new PointerEvent('pointerup', { bubbles: true, pointerId: nextPointerId - 1 })
			);
			await wait(50);
			expect(panel()).toBeTruthy();
		});
	});

	describe('Snap points', () => {
		// The harness panel is 200px tall, so pixel snap points translate to offsets
		// of 0 and 100 with no dependence on the runner's viewport size.
		const snapPoints = [200, 100];

		it('rests at the most open point by default', async () => {
			render(DrawerTest, { defaultOpen: true, snapPoints });
			await expect.poll(panel).toBeTruthy();

			await expect
				.poll(() => panel()!.style.getPropertyValue('--drawer-snap-point-offset'))
				.toBe('0px');
			expect(panel()!.getAttribute('data-expanded')).toBe('true');
		});

		it('keeps the backdrop steady while moving between snap points', async () => {
			render(DrawerTest, { defaultOpen: true, snapPoints });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			await drag(
				content,
				{ x: start.left + 20, y: start.top + 10 },
				[
					{ x: start.left + 20, y: start.top + 40 },
					{ x: start.left + 20, y: start.top + 70 }
				],
				{ release: false, stepDelay: 100 }
			);

			// 60px down on a panel whose last snap point is 100px out: still inside the
			// open range, so the backdrop must not have started fading.
			expect(content.style.getPropertyValue('--drawer-swipe-movement-y')).toBe('60px');
			expect(content.style.getPropertyValue('--drawer-swipe-progress')).toBe('0');

			// Past the last point it starts to matter: 40px of the 100px still to go.
			window.dispatchEvent(
				new PointerEvent('pointermove', {
					bubbles: true,
					pointerId: nextPointerId - 1,
					pointerType: 'touch',
					clientX: start.left + 20,
					clientY: start.top + 150
				})
			);
			await wait(20);
			expect(
				Number.parseFloat(content.style.getPropertyValue('--drawer-swipe-progress'))
			).toBeCloseTo(0.4, 2);

			window.dispatchEvent(
				new PointerEvent('pointerup', { bubbles: true, pointerId: nextPointerId - 1 })
			);
			await wait(50);
		});

		it('rests at the requested point', async () => {
			render(DrawerTest, { defaultOpen: true, snapPoints, defaultSnapPoint: 100 });
			await expect.poll(panel).toBeTruthy();

			await expect
				.poll(() => panel()!.style.getPropertyValue('--drawer-snap-point-offset'))
				.toBe('100px');
			// Only the largest point counts as expanded.
			expect(panel()!.hasAttribute('data-expanded')).toBe(false);
		});

		it('settles on the next point down instead of dismissing', async () => {
			const onSnapPointChange = vi.fn();
			render(DrawerTest, { defaultOpen: true, snapPoints, onSnapPointChange });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			// Deliberately unhurried: at ~0.3px/ms the release projects to ~114px, which
			// lands on the 100px point without reaching the dismissal threshold.
			await drag(
				content,
				{ x: start.left + 20, y: start.top + 10 },
				[
					{ x: start.left + 20, y: start.top + 40 },
					{ x: start.left + 20, y: start.top + 70 }
				],
				{ stepDelay: 100 }
			);

			await wait(50);
			expect(panel()).toBeTruthy();
			expect(onSnapPointChange).toHaveBeenCalledWith(100, expect.anything());
			expect(panel()!.style.getPropertyValue('--drawer-snap-point-offset')).toBe('100px');
		});

		it('lets a hard flick from the top point dismiss outright', async () => {
			render(DrawerTest, { defaultOpen: true, snapPoints });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			await drag(
				content,
				{ x: start.left + 20, y: start.top + 10 },
				[
					{ x: start.left + 20, y: start.top + 50 },
					{ x: start.left + 20, y: start.top + 90 }
				],
				{ stepDelay: 60 }
			);

			await expect.poll(panel).toBeNull();
		});

		it('holds that flick to one step with snapToSequentialPoints', async () => {
			const onSnapPointChange = vi.fn();
			render(DrawerTest, {
				defaultOpen: true,
				snapPoints,
				snapToSequentialPoints: true,
				dismissible: false,
				onSnapPointChange
			});
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			await drag(
				content,
				{ x: start.left + 20, y: start.top + 10 },
				[
					{ x: start.left + 20, y: start.top + 50 },
					{ x: start.left + 20, y: start.top + 90 }
				],
				{ stepDelay: 60 }
			);

			await wait(50);
			expect(panel()).toBeTruthy();
			expect(onSnapPointChange).toHaveBeenCalledWith(100, expect.anything());
		});

		it('dismisses when dragged past the last point', async () => {
			render(DrawerTest, { defaultOpen: true, snapPoints, defaultSnapPoint: 100 });
			await expect.poll(panel).toBeTruthy();

			const content = panel()!;
			const start = content.getBoundingClientRect();
			await drag(content, { x: start.left + 20, y: start.top + 10 }, [
				{ x: start.left + 20, y: start.top + 60 },
				{ x: start.left + 20, y: start.top + 110 }
			]);

			await expect.poll(panel).toBeNull();
		});
	});

	describe('Layout', () => {
		it('pins itself to its edge without a viewport', async () => {
			render(DrawerTest, { defaultOpen: true, side: 'bottom' });
			await expect.poll(panel).toBeTruthy();
			expect(panel()!.style.position).toBe('fixed');
			expect(panel()!.style.bottom).toBe('0px');
		});

		it('stays in flow inside a viewport', async () => {
			render(DrawerTest, { defaultOpen: true, withViewport: true });
			await expect.poll(panel).toBeTruthy();
			// `relative`, not unset: the panel has to be a containing block for the bleed
			// box that covers an overdrag. The viewport still does the placing.
			expect(panel()!.style.position).toBe('relative');
			expect(document.querySelector<HTMLElement>('[data-drawer-viewport]')!.style.position).toBe(
				'fixed'
			);
		});
	});
});
