import { tick } from 'svelte';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import type { TooltipOpenChangeDetails } from '../types';
import { resetTooltipGroup } from './tooltip-group';
import TooltipTest from './tooltip-test.svelte';

function byTestId<T extends HTMLElement = HTMLElement>(id: string): T {
	const element = document.querySelector<T>(`[data-testid="${id}"]`);
	if (!element) throw new Error(`No element with data-testid="${id}"`);
	return element;
}

function content(id = 'content'): HTMLElement | null {
	return document.querySelector<HTMLElement>(`[data-testid="${id}"]`);
}

async function pointer(
	target: Element,
	type: 'pointerenter' | 'pointerleave' | 'pointerdown',
	pointerType: 'mouse' | 'touch' | 'pen' = 'mouse'
) {
	target.dispatchEvent(
		new PointerEvent(type, {
			pointerType,
			pointerId: 1,
			button: 0,
			bubbles: type === 'pointerdown',
			cancelable: true
		})
	);
	await tick();
}

/** Moves the pointer on the document to a viewport point. */
async function moveTo(x: number, y: number, pointerType: 'mouse' | 'touch' = 'mouse') {
	document.dispatchEvent(
		new PointerEvent('pointermove', {
			clientX: x,
			clientY: y,
			pointerType,
			pointerId: 1,
			bubbles: true
		})
	);
	await tick();
}

/** The pointer leaves the trigger and goes somewhere far from the content. */
async function leaveAway(trigger: Element) {
	await pointer(trigger, 'pointerleave');
	await moveTo(-1000, -1000);
}

/**
 * Parks the real mouse in a corner of the viewport. It rests where the file before left it, and
 * on the trigger it is a hover that opens the tooltip and holds it open under the synthetic
 * pointer of these tests.
 */
async function parkMouse() {
	const spot = document.createElement('div');
	spot.style.cssText = 'position: fixed; right: 0; bottom: 0; width: 8px; height: 8px;';
	document.body.append(spot);
	await userEvent.hover(spot);
	spot.remove();
}

/** Runs the timers `ms` forward, and lets the DOM catch up. */
async function advance(ms: number) {
	await vi.advanceTimersByTimeAsync(ms);
	await tick();
}

type Change = [boolean, TooltipOpenChangeDetails['reason']];

describe('Tooltip', () => {
	beforeEach(async () => {
		await parkMouse();
		resetTooltipGroup();
		vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] });
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('renders nothing while closed, and the trigger describes nothing', async () => {
		render(TooltipTest);

		expect(content()).toBeNull();
		expect(byTestId('trigger').hasAttribute('aria-describedby')).toBe(false);
		expect(byTestId('trigger').getAttribute('data-state')).toBe('closed');
		expect(byTestId('trigger').getAttribute('type')).toBe('button');
	});

	describe('pointer', () => {
		it('opens after the delay, with role tooltip, and the trigger points at it', async () => {
			const changes: Change[] = [];
			render(TooltipTest, {
				delay: 500,
				onOpenChange: (open, details) => changes.push([open, details.reason])
			});
			const trigger = byTestId('trigger');

			await pointer(trigger, 'pointerenter');
			await advance(400);
			expect(content()).toBeNull();

			await advance(100);
			const panel = content();
			expect(panel).not.toBeNull();
			expect(panel?.getAttribute('role')).toBe('tooltip');
			expect(panel?.textContent?.trim()).toBe('Save the document');
			expect(trigger.getAttribute('aria-describedby')).toBe(panel?.id);
			expect(trigger.getAttribute('data-state')).toBe('open');
			expect(panel?.getAttribute('data-state')).toBe('open');
			expect(changes).toEqual([[true, 'hover']]);
		});

		it('closes after the close delay when the pointer leaves', async () => {
			const changes: Change[] = [];
			render(TooltipTest, {
				delay: 0,
				closeDelay: 200,
				onOpenChange: (open, details) => changes.push([open, details.reason])
			});
			const trigger = byTestId('trigger');

			await pointer(trigger, 'pointerenter');
			expect(content()).not.toBeNull();

			await leaveAway(trigger);
			await advance(150);
			expect(trigger.getAttribute('data-state')).toBe('open');
			await advance(50);
			expect(trigger.getAttribute('data-state')).toBe('closed');
			expect(trigger.hasAttribute('aria-describedby')).toBe(false);
			expect(changes).toEqual([
				[true, 'hover'],
				[false, 'hover-out']
			]);
		});

		it('stays open while the pointer rests on the content', async () => {
			render(TooltipTest, { delay: 0, closeDelay: 200 });
			const trigger = byTestId('trigger');

			await pointer(trigger, 'pointerenter');
			await leaveAway(trigger);
			await advance(100);
			const panel = content();
			expect(panel).not.toBeNull();
			await pointer(panel as HTMLElement, 'pointerenter');
			await advance(500);
			expect(trigger.getAttribute('data-state')).toBe('open');

			await pointer(panel as HTMLElement, 'pointerleave');
			await advance(200);
			expect(trigger.getAttribute('data-state')).toBe('closed');
		});

		it('waits for a pointer that crosses the gap toward the content', async () => {
			render(TooltipTest, { delay: 0, closeDelay: 0, placement: 'bottom' });
			const trigger = byTestId('trigger');

			await pointer(trigger, 'pointerenter');
			const panel = content() as HTMLElement;
			await expect.poll(() => panel.style.left).toMatch(/px$/);
			const triggerRect = trigger.getBoundingClientRect();
			const panelRect = panel.getBoundingClientRect();
			const exit = { x: triggerRect.left + triggerRect.width / 2, y: triggerRect.bottom };

			trigger.dispatchEvent(
				new PointerEvent('pointerleave', {
					clientX: exit.x,
					clientY: exit.y,
					pointerType: 'mouse',
					pointerId: 1
				})
			);
			await tick();
			// A move on the straight line to the panel keeps it open past the close delay.
			await moveTo(exit.x, (exit.y + panelRect.top) / 2);
			await advance(200);
			expect(trigger.getAttribute('data-state')).toBe('open');

			// A move to the side closes it.
			await moveTo(exit.x - 300, (exit.y + panelRect.top) / 2);
			await advance(10);
			expect(trigger.getAttribute('data-state')).toBe('closed');
		});

		it('closes when the pointer stops in the gap', async () => {
			render(TooltipTest, { delay: 0, closeDelay: 0, placement: 'bottom' });
			const trigger = byTestId('trigger');

			await pointer(trigger, 'pointerenter');
			const panel = content() as HTMLElement;
			await expect.poll(() => panel.style.left).toMatch(/px$/);
			const triggerRect = trigger.getBoundingClientRect();
			const panelRect = panel.getBoundingClientRect();
			const x = triggerRect.left + triggerRect.width / 2;

			trigger.dispatchEvent(
				new PointerEvent('pointerleave', {
					clientX: x,
					clientY: triggerRect.bottom,
					pointerType: 'mouse',
					pointerId: 1
				})
			);
			await tick();
			await moveTo(x, (triggerRect.bottom + panelRect.top) / 2);
			await advance(250);
			expect(trigger.getAttribute('data-state')).toBe('open');
			await advance(100);
			expect(trigger.getAttribute('data-state')).toBe('closed');
		});

		it('does not open when the open is canceled by a leave before the delay', async () => {
			render(TooltipTest, { delay: 500 });
			const trigger = byTestId('trigger');

			await pointer(trigger, 'pointerenter');
			await advance(300);
			await pointer(trigger, 'pointerleave');
			await advance(500);

			expect(content()).toBeNull();
		});

		it('does not open on a touch', async () => {
			render(TooltipTest, { delay: 0 });

			await pointer(byTestId('trigger'), 'pointerenter', 'touch');
			await advance(100);

			expect(content()).toBeNull();
		});

		it('closes on a press on the trigger, and stays closed until the pointer leaves', async () => {
			const changes: Change[] = [];
			render(TooltipTest, {
				delay: 0,
				onOpenChange: (open, details) => changes.push([open, details.reason])
			});
			const trigger = byTestId('trigger');

			await pointer(trigger, 'pointerenter');
			expect(trigger.getAttribute('data-state')).toBe('open');
			await pointer(trigger, 'pointerdown');
			expect(trigger.getAttribute('data-state')).toBe('closed');

			await pointer(trigger, 'pointerenter');
			await advance(100);
			expect(trigger.getAttribute('data-state')).toBe('closed');

			await pointer(trigger, 'pointerleave');
			await pointer(trigger, 'pointerenter');
			expect(trigger.getAttribute('data-state')).toBe('open');
			expect(changes).toEqual([
				[true, 'hover'],
				[false, 'trigger-press'],
				[true, 'hover']
			]);
		});
	});

	describe('long press', () => {
		function touch(target: Element, type: 'pointerdown' | 'pointerup', x = 10, y = 10) {
			target.dispatchEvent(
				new PointerEvent(type, {
					pointerType: 'touch',
					pointerId: 2,
					isPrimary: true,
					button: 0,
					clientX: x,
					clientY: y,
					bubbles: true,
					cancelable: true
				})
			);
		}

		it('opens on a long press of a touch, and closes on a press somewhere else', async () => {
			const changes: Change[] = [];
			render(TooltipTest, {
				onOpenChange: (open, details) => changes.push([open, details.reason])
			});
			const trigger = byTestId('trigger');

			touch(trigger, 'pointerdown');
			await advance(400);
			expect(content()).toBeNull();
			await advance(100);
			expect(content()).not.toBeNull();
			touch(trigger, 'pointerup');
			await advance(100);
			expect(trigger.getAttribute('data-state')).toBe('open');

			touch(byTestId('after'), 'pointerdown');
			await tick();
			expect(trigger.getAttribute('data-state')).toBe('closed');
			expect(changes).toEqual([
				[true, 'hover'],
				[false, 'hover-out']
			]);
		});

		it('closes on a tap on the trigger, which then works as a press', async () => {
			const changes: Change[] = [];
			render(TooltipTest, {
				onOpenChange: (open, details) => changes.push([open, details.reason])
			});
			const trigger = byTestId('trigger');

			touch(trigger, 'pointerdown');
			await advance(500);
			touch(trigger, 'pointerup');
			await advance(100);
			expect(trigger.getAttribute('data-state')).toBe('open');

			touch(trigger, 'pointerdown');
			await tick();
			expect(trigger.getAttribute('data-state')).toBe('closed');
			touch(trigger, 'pointerup');
			await advance(600);
			expect(trigger.getAttribute('data-state')).toBe('closed');
			expect(changes).toEqual([
				[true, 'hover'],
				[false, 'trigger-press']
			]);
		});

		it('does not open on a long press when the prop is off', async () => {
			render(TooltipTest, { openOnLongPress: false });

			touch(byTestId('trigger'), 'pointerdown');
			await advance(600);

			expect(content()).toBeNull();
		});

		it('keeps a quick tap as a press when the prop is off', async () => {
			const changes: Change[] = [];
			render(TooltipTest, {
				openOnLongPress: false,
				delay: 0,
				onOpenChange: (open, details) => changes.push([open, details.reason])
			});
			const trigger = byTestId('trigger');

			touch(trigger, 'pointerdown');
			touch(trigger, 'pointerup');
			await advance(100);

			expect(content()).toBeNull();
			expect(changes).toEqual([]);
		});
	});

	describe('keyboard', () => {
		it('opens at once on a keyboard focus, and closes on the blur', async () => {
			const changes: Change[] = [];
			render(TooltipTest, {
				delay: 500,
				onOpenChange: (open, details) => changes.push([open, details.reason])
			});
			const trigger = byTestId('trigger');

			byTestId('before').focus();
			await userEvent.keyboard('{Tab}');

			expect(document.activeElement).toBe(trigger);
			expect(content()).not.toBeNull();
			expect(trigger.getAttribute('aria-describedby')).toBe(content()?.id);

			await userEvent.keyboard('{Tab}');
			expect(trigger.getAttribute('data-state')).toBe('closed');
			expect(changes).toEqual([
				[true, 'focus'],
				[false, 'focus-out']
			]);
		});

		it('does not open on a focus that a script gave after a pointer press', async () => {
			render(TooltipTest, { delay: 0 });
			const trigger = byTestId('trigger');

			await userEvent.click(byTestId('before'));
			trigger.focus();
			await advance(100);

			expect(document.activeElement).toBe(trigger);
			expect(content()).toBeNull();
		});

		it('keeps a focus-opened tooltip while the pointer leaves', async () => {
			render(TooltipTest, { delay: 0, closeDelay: 0 });
			const trigger = byTestId('trigger');

			byTestId('before').focus();
			await userEvent.keyboard('{Tab}');
			await pointer(trigger, 'pointerenter');
			await pointer(trigger, 'pointerleave');
			await advance(100);

			expect(trigger.getAttribute('data-state')).toBe('open');
		});

		it('closes on Escape, and takes that Escape for itself', async () => {
			const changes: Change[] = [];
			render(TooltipTest, {
				delay: 0,
				onOpenChange: (open, details) => changes.push([open, details.reason])
			});
			const trigger = byTestId('trigger');

			await pointer(trigger, 'pointerenter');
			expect(trigger.getAttribute('data-state')).toBe('open');

			const escape = new KeyboardEvent('keydown', {
				key: 'Escape',
				bubbles: true,
				cancelable: true
			});
			document.body.dispatchEvent(escape);
			await tick();
			expect(escape.defaultPrevented).toBe(true);
			expect(trigger.getAttribute('data-state')).toBe('closed');

			const secondEscape = new KeyboardEvent('keydown', {
				key: 'Escape',
				bubbles: true,
				cancelable: true
			});
			document.body.dispatchEvent(secondEscape);
			expect(secondEscape.defaultPrevented).toBe(false);
			expect(changes).toEqual([
				[true, 'hover'],
				[false, 'escape-key']
			]);
		});
	});

	describe('group', () => {
		it('closes the open tooltip when another one opens', async () => {
			const first: Change[] = [];
			const second: Change[] = [];
			render(TooltipTest, {
				delay: 0,
				second: true,
				onOpenChange: (open, details) => first.push([open, details.reason]),
				onSecondOpenChange: (open, details) => second.push([open, details.reason])
			});

			await pointer(byTestId('trigger'), 'pointerenter');
			expect(content()).not.toBeNull();

			await leaveAway(byTestId('trigger'));
			await pointer(byTestId('trigger-2'), 'pointerenter');
			await tick();

			expect(content('content-2')).not.toBeNull();
			expect(byTestId('trigger').getAttribute('data-state')).toBe('closed');
			expect(first).toEqual([
				[true, 'hover'],
				[false, 'other-tooltip']
			]);
			expect(second).toEqual([[true, 'hover']]);
		});

		it('skips the delay for a tooltip that opens soon after another closed', async () => {
			render(TooltipTest, { delay: 500, closeDelay: 0, second: true });

			await pointer(byTestId('trigger'), 'pointerenter');
			await advance(500);
			expect(byTestId('trigger').getAttribute('data-state')).toBe('open');
			await leaveAway(byTestId('trigger'));
			expect(byTestId('trigger').getAttribute('data-state')).toBe('closed');

			await advance(100);
			await pointer(byTestId('trigger-2'), 'pointerenter');
			expect(byTestId('trigger-2').getAttribute('data-state')).toBe('open');
		});

		it('waits the full delay again after the skip window', async () => {
			render(TooltipTest, { delay: 500, closeDelay: 0, second: true });

			await pointer(byTestId('trigger'), 'pointerenter');
			await advance(500);
			await leaveAway(byTestId('trigger'));

			await advance(400);
			await pointer(byTestId('trigger-2'), 'pointerenter');
			expect(byTestId('trigger-2').getAttribute('data-state')).toBe('closed');
			await advance(500);
			expect(byTestId('trigger-2').getAttribute('data-state')).toBe('open');
		});
	});

	describe('state', () => {
		it('never opens while disabled', async () => {
			render(TooltipTest, { delay: 0, disabled: true });
			const trigger = byTestId('trigger');

			await pointer(trigger, 'pointerenter');
			byTestId('before').focus();
			await userEvent.keyboard('{Tab}');

			expect(content()).toBeNull();
		});

		it('writes the open state back to bind:open', async () => {
			render(TooltipTest, { delay: 0 });

			await pointer(byTestId('trigger'), 'pointerenter');

			await expect.poll(() => byTestId('bound-open').textContent).toBe('true');
		});

		it('lets a controlled parent refuse the open', async () => {
			const changes: Change[] = [];
			render(TooltipTest, {
				delay: 0,
				open: false,
				controlledOpen: true,
				onOpenChange: (open, details) => changes.push([open, details.reason])
			});

			await pointer(byTestId('trigger'), 'pointerenter');
			await advance(10);

			expect(changes).toEqual([[true, 'hover']]);
			expect(content()).toBeNull();
		});

		it('refuses a change through details.cancel()', async () => {
			render(TooltipTest, {
				delay: 0,
				onOpenChange: (open, details) => {
					if (!open) details.cancel();
				}
			});
			const trigger = byTestId('trigger');

			await pointer(trigger, 'pointerenter');
			await leaveAway(trigger);
			await advance(500);

			expect(trigger.getAttribute('data-state')).toBe('open');
		});

		it('opens with defaultOpen', async () => {
			render(TooltipTest, { defaultOpen: true });

			await expect.poll(() => content()).not.toBeNull();
			expect(byTestId('trigger').getAttribute('aria-describedby')).toBe(content()?.id);
		});
	});

	describe('custom trigger', () => {
		it('takes any element through triggerRef, and keeps the descriptions it had', async () => {
			render(TooltipTest, { delay: 0, customTrigger: true });
			const link = byTestId('custom');

			await expect.poll(() => link.getAttribute('data-state')).toBe('closed');
			await pointer(link, 'pointerenter');

			expect(link.getAttribute('data-state')).toBe('open');
			expect(link.getAttribute('aria-describedby')).toBe(`hint ${content()?.id}`);

			await leaveAway(link);
			await advance(200);
			expect(link.getAttribute('aria-describedby')).toBe('hint');
		});
	});

	describe('position', () => {
		it('follows the pointer along the x axis', async () => {
			render(TooltipTest, { delay: 0, followPointer: 'x', wide: true, placement: 'bottom' });
			const trigger = byTestId('trigger');
			const rect = trigger.getBoundingClientRect();
			const y = rect.top + rect.height / 2;

			trigger.dispatchEvent(
				new PointerEvent('pointermove', {
					clientX: rect.left + 20,
					clientY: y,
					pointerType: 'mouse',
					pointerId: 1
				})
			);
			await pointer(trigger, 'pointerenter');
			const panel = content() as HTMLElement;
			await expect.poll(() => panel.style.left).toMatch(/px$/);
			const firstLeft = parseFloat(panel.style.left);

			trigger.dispatchEvent(
				new PointerEvent('pointermove', {
					clientX: rect.left + 180,
					clientY: y,
					pointerType: 'mouse',
					pointerId: 1
				})
			);
			await expect.poll(() => parseFloat(panel.style.left)).toBeGreaterThan(firstLeft + 100);
			// The panel stays under the trigger: the y axis does not follow.
			expect(panel.getAttribute('data-placement')).toBe('bottom');
		});

		it('places the panel and the arrow against the trigger', async () => {
			render(TooltipTest, { delay: 0, withArrow: true, placement: 'bottom' });

			await pointer(byTestId('trigger'), 'pointerenter');

			await expect.poll(() => content()?.getAttribute('data-placement')).toBe('bottom');
			await expect.poll(() => byTestId('arrow').getAttribute('data-placement')).toBe('bottom');
			expect(byTestId('arrow').style.left).toMatch(/px$/);
			expect(byTestId('arrow').getAttribute('aria-hidden')).toBe('true');
		});
	});
});
