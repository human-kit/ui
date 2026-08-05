import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import MenuContextTriggerTest from './menu-context-trigger-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

function queryMenu() {
	return document.querySelector('[role="menu"]') as HTMLElement | null;
}

function queryOpenMenu() {
	return document.querySelector('[role="menu"][data-state="open"]') as HTMLElement | null;
}

function surface() {
	return document.querySelector('[data-context-trigger]') as HTMLElement;
}

/** Right click at a viewport point, reporting whether the browser's own menu was suppressed. */
function rightClick(node: Element, x: number, y: number) {
	const event = new MouseEvent('contextmenu', {
		bubbles: true,
		cancelable: true,
		button: 2,
		clientX: x,
		clientY: y
	});
	node.dispatchEvent(event);
	return { defaultPrevented: event.defaultPrevented };
}

function pointerDown(node: Element, init: PointerEventInit = {}) {
	node.dispatchEvent(
		new PointerEvent('pointerdown', {
			bubbles: true,
			pointerId: 1,
			pointerType: 'mouse',
			isPrimary: true,
			button: 0,
			...init
		})
	);
}

describe('Menu.ContextTrigger', () => {
	afterEach(() => {
		document.querySelectorAll('[role="menu"]').forEach((menu) => menu.remove());
	});

	describe('pointer', () => {
		it('opens at the point of the right click and suppresses the native menu', async () => {
			render(MenuContextTriggerTest);

			const { defaultPrevented } = rightClick(surface(), 120, 90);
			expect(defaultPrevented).toBe(true);

			await expect.poll(() => queryOpenMenu()).toBeTruthy();
			// Anchored at the pointer with no offset, unfolding down and to the right.
			await expect.poll(() => queryMenu()!.getBoundingClientRect().left).toBeCloseTo(120, 0);
			expect(queryMenu()!.getBoundingClientRect().top).toBeCloseTo(90, 0);
		});

		it('re-anchors when the surface is right clicked again, without closing', async () => {
			const onOpenChange = vi.fn();
			render(MenuContextTriggerTest, { onOpenChange });

			rightClick(surface(), 40, 40);
			await expect.poll(() => queryOpenMenu()).toBeTruthy();

			rightClick(surface(), 150, 130);
			await expect.poll(() => queryMenu()!.getBoundingClientRect().left).toBeCloseTo(150, 0);

			expect(queryOpenMenu()).toBeTruthy();
			// One transition, not a close/reopen pair.
			expect(onOpenChange).toHaveBeenCalledTimes(1);
		});

		it('closes on a left press on its own surface, like a native menu', async () => {
			render(MenuContextTriggerTest);

			rightClick(surface(), 60, 60);
			await expect.poll(() => queryOpenMenu()).toBeTruthy();

			pointerDown(surface());
			await expect.poll(() => queryOpenMenu()).toBeNull();
		});

		it('closes on a press outside', async () => {
			const screen = render(MenuContextTriggerTest);

			rightClick(surface(), 60, 60);
			await expect.poll(() => queryOpenMenu()).toBeTruthy();

			await screen.getByRole('button', { name: 'Outside' }).click();
			await expect.poll(() => queryOpenMenu()).toBeNull();
		});

		it('leaves the browser menu alone when disabled', async () => {
			render(MenuContextTriggerTest, { disabled: true });

			const { defaultPrevented } = rightClick(surface(), 60, 60);

			expect(defaultPrevented).toBe(false);
			expect(queryMenu()).toBeNull();
		});
	});

	describe('keyboard', () => {
		it('opens with Shift+F10 anchored to the surface, first item focused', async () => {
			render(MenuContextTriggerTest);

			// Park the real pointer on the surface: left where a previous test dropped it,
			// it can end up over the panel and hover-highlight an item out from under the
			// keyboard's first-item focus.
			await userEvent.hover(surface());
			surface().focus();
			await userEvent.keyboard('{Shift>}{F10}{/Shift}');

			await expect.poll(() => queryOpenMenu()).toBeTruthy();
			await expect
				.poll(() =>
					document.querySelector('[role="menuitem"][data-highlighted]')?.textContent?.trim()
				)
				.toBe('Edit');

			// No pointer was involved, so the panel hangs off the surface itself.
			await expect
				.poll(() => queryMenu()!.getBoundingClientRect().left)
				.toBeCloseTo(surface().getBoundingClientRect().left, 0);
			expect(queryMenu()!.getBoundingClientRect().top).toBeGreaterThanOrEqual(
				surface().getBoundingClientRect().bottom - 1
			);
		});

		it('opens with the dedicated ContextMenu key', async () => {
			render(MenuContextTriggerTest);

			surface().focus();
			await userEvent.keyboard('{ContextMenu}');

			await expect.poll(() => queryOpenMenu()).toBeTruthy();
		});

		it('closes on Escape and returns focus to the surface', async () => {
			render(MenuContextTriggerTest);

			surface().focus();
			await userEvent.keyboard('{Shift>}{F10}{/Shift}');
			await expect.poll(() => queryOpenMenu()).toBeTruthy();

			await userEvent.keyboard('{Escape}');
			await expect.poll(() => queryOpenMenu()).toBeNull();
			await expect.poll(() => document.activeElement).toBe(surface());
		});

		it('is reachable with the keyboard and announces its shortcut', async () => {
			render(MenuContextTriggerTest);

			expect(surface()).toHaveAttribute('tabindex', '0');
			expect(surface()).toHaveAttribute('aria-keyshortcuts', 'Shift+F10');
			// A generic element cannot carry aria-expanded / aria-haspopup: they are not
			// global ARIA properties, and claiming them here would be invalid.
			expect(surface()).not.toHaveAttribute('aria-expanded');
		});

		it('does not open while disabled', async () => {
			render(MenuContextTriggerTest, { disabled: true });

			surface().focus();
			await userEvent.keyboard('{Shift>}{F10}{/Shift}');

			expect(queryMenu()).toBeNull();
		});
	});

	describe('touch', () => {
		const LONG_PRESS_DELAY = 40;

		function touch(node: Element, type: string, init: PointerEventInit = {}) {
			node.dispatchEvent(
				new PointerEvent(type, {
					bubbles: true,
					pointerId: 5,
					pointerType: 'touch',
					isPrimary: true,
					button: 0,
					...init
				})
			);
		}

		it('opens on a long press at the point of the finger', async () => {
			render(MenuContextTriggerTest, { longPressDelay: LONG_PRESS_DELAY });

			touch(surface(), 'pointerdown', { clientX: 70, clientY: 80 });

			await expect.poll(() => queryOpenMenu()).toBeTruthy();
			const rect = queryMenu()!.getBoundingClientRect();
			expect(rect.left).toBeCloseTo(70, 0);
			expect(rect.top).toBeCloseTo(80, 0);
		});

		it('does not open when the finger travels — that gesture is a scroll', async () => {
			render(MenuContextTriggerTest, { longPressDelay: LONG_PRESS_DELAY });

			touch(surface(), 'pointerdown', { clientX: 70, clientY: 80 });
			window.dispatchEvent(
				new PointerEvent('pointermove', {
					pointerId: 5,
					pointerType: 'touch',
					isPrimary: true,
					clientX: 70,
					clientY: 140
				})
			);

			await new Promise((resolve) => setTimeout(resolve, LONG_PRESS_DELAY * 3));
			expect(queryMenu()).toBeNull();
		});

		it('does not open on a long press when long press is off', async () => {
			render(MenuContextTriggerTest, { longPress: false, longPressDelay: LONG_PRESS_DELAY });

			touch(surface(), 'pointerdown', { clientX: 70, clientY: 80 });

			await new Promise((resolve) => setTimeout(resolve, LONG_PRESS_DELAY * 3));
			expect(queryMenu()).toBeNull();
		});
	});

	describe('menu behaviour is unchanged', () => {
		it('runs an item action and closes', async () => {
			const onAction = vi.fn();
			const screen = render(MenuContextTriggerTest, { onAction });

			rightClick(surface(), 60, 60);
			await expect.poll(() => queryOpenMenu()).toBeTruthy();

			await screen.getByRole('menuitem', { name: 'Edit' }).click();

			expect(onAction).toHaveBeenCalledWith('edit');
			await expect.poll(() => queryOpenMenu()).toBeNull();
		});

		it('opens a submenu from a context menu', async () => {
			const screen = render(MenuContextTriggerTest, { withSubmenu: true });

			rightClick(surface(), 60, 60);
			await expect.poll(() => queryOpenMenu()).toBeTruthy();

			await screen.getByRole('menuitem', { name: 'More actions' }).click();
			await expect.poll(() => document.querySelectorAll('[role="menu"]').length).toBe(2);
		});

		it('never reports a false focus state', async () => {
			render(MenuContextTriggerTest);

			rightClick(surface(), 60, 60);
			await expect.poll(() => queryOpenMenu()).toBeTruthy();
			expectNoFalseFocusAttributes();

			pointerDown(surface());
			await expect.poll(() => queryOpenMenu()).toBeNull();
			expectNoFalseFocusAttributes();
		});
	});
});
