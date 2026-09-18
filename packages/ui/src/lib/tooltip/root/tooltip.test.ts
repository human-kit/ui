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

/** Runs the timers `ms` forward, and lets the DOM catch up. */
async function advance(ms: number) {
	await vi.advanceTimersByTimeAsync(ms);
	await tick();
}

type Change = [boolean, TooltipOpenChangeDetails['reason']];

describe('Tooltip', () => {
	beforeEach(() => {
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

			await pointer(trigger, 'pointerleave');
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
			await pointer(trigger, 'pointerleave');
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

			await pointer(byTestId('trigger'), 'pointerleave');
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
			await pointer(byTestId('trigger'), 'pointerleave');
			expect(byTestId('trigger').getAttribute('data-state')).toBe('closed');

			await advance(100);
			await pointer(byTestId('trigger-2'), 'pointerenter');
			expect(byTestId('trigger-2').getAttribute('data-state')).toBe('open');
		});

		it('waits the full delay again after the skip window', async () => {
			render(TooltipTest, { delay: 500, closeDelay: 0, second: true });

			await pointer(byTestId('trigger'), 'pointerenter');
			await advance(500);
			await pointer(byTestId('trigger'), 'pointerleave');

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
			await pointer(trigger, 'pointerleave');
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

			await pointer(link, 'pointerleave');
			await advance(200);
			expect(link.getAttribute('aria-describedby')).toBe('hint');
		});
	});

	describe('position', () => {
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
