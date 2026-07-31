import { describe, it, expect, afterEach } from 'vitest';
import { render } from 'vitest-browser-svelte';
import SwipeAreaTest from './drawer-swipe-area-test.svelte';

afterEach(() => {
	document.querySelectorAll('[data-drawer-content]').forEach((node) => node.remove());
	document.querySelectorAll('[data-drawer-overlay]').forEach((node) => node.remove());
});

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function panel(): HTMLElement | null {
	return document.querySelector<HTMLElement>('[data-drawer-content]');
}

let nextPointerId = 500;

async function dragFrom(
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
}

describe('Drawer.SwipeArea', () => {
	it('sits on the drawer’s edge while closed', () => {
		render(SwipeAreaTest);
		const area = document.querySelector<HTMLElement>('[data-drawer-swipe-area]')!;

		expect(area.getAttribute('data-state')).toBe('closed');
		// A bottom drawer opens by swiping up, so its strip hugs the bottom edge.
		expect(area.getAttribute('data-swipe-direction')).toBe('up');
		expect(area.style.bottom).toBe('0px');
		expect(area.style.height).toBe('40px');
	});

	it('opens the drawer when dragged far enough inward', async () => {
		render(SwipeAreaTest);
		const area = document.querySelector<HTMLElement>('[data-drawer-swipe-area]')!;
		const rect = area.getBoundingClientRect();

		expect(panel()).toBeNull();

		await dragFrom(area, { x: rect.left + 20, y: rect.top + 20 }, [
			{ x: rect.left + 20, y: rect.top - 40 },
			{ x: rect.left + 20, y: rect.top - 110 },
			{ x: rect.left + 20, y: rect.top - 170 }
		]);

		await expect.poll(panel).toBeTruthy();
	});

	it('backs out again when the drag stops short', async () => {
		render(SwipeAreaTest);
		const area = document.querySelector<HTMLElement>('[data-drawer-swipe-area]')!;
		const rect = area.getBoundingClientRect();

		// 20px of a 200px panel, released slowly: below both the distance and the
		// velocity threshold.
		await dragFrom(
			area,
			{ x: rect.left + 20, y: rect.top + 20 },
			[
				{ x: rect.left + 20, y: rect.top + 8 },
				{ x: rect.left + 20, y: rect.top }
			],
			{ stepDelay: 80 }
		);

		await expect.poll(panel).toBeNull();
	});

	it('drags the panel in with the finger', async () => {
		render(SwipeAreaTest);
		const area = document.querySelector<HTMLElement>('[data-drawer-swipe-area]')!;
		const rect = area.getBoundingClientRect();

		// Two unhurried steps: a single 50px jump would read as a flick, which opens the
		// drawer outright and is a different behaviour than the one under test.
		await dragFrom(
			area,
			{ x: rect.left + 20, y: rect.top + 20 },
			[
				{ x: rect.left + 20, y: rect.top - 5 },
				{ x: rect.left + 20, y: rect.top - 30 }
			],
			{ release: false, stepDelay: 100 }
		);

		await expect.poll(panel).toBeTruthy();
		const content = panel()!;
		expect(content.getAttribute('data-swiping')).toBe('true');
		// 50px pulled in on a 200px panel leaves 150px still outside.
		await expect
			.poll(() => content.style.getPropertyValue('--drawer-swipe-movement-y'))
			.toBe('150px');

		// Released at the same point, so the drag falls short and the drawer backs out.
		// Dispatching a bare pointerup instead would report a release at (0, 0) — a
		// full-screen drag — and leave this drawer open for the next test to trip over.
		window.dispatchEvent(
			new PointerEvent('pointerup', {
				bubbles: true,
				pointerId: nextPointerId - 1,
				clientX: rect.left + 20,
				clientY: rect.top - 30
			})
		);
		await expect.poll(panel).toBeNull();
	});

	it('stops listening once the drawer is open', async () => {
		const screen = render(SwipeAreaTest);
		await screen.getByRole('button', { name: 'Open' }).click();
		await expect.poll(panel).toBeTruthy();

		const area = document.querySelector<HTMLElement>('[data-drawer-swipe-area]')!;
		expect(area.getAttribute('data-state')).toBe('open');
		// Transparent to pointers, so it can never sit between the user and the panel.
		expect(area.style.pointerEvents).toBe('none');
	});
});
