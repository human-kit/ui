import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import MenuTest from './menu-test.svelte';
import MenuRichContentTest from './menu-rich-content-test.svelte';
import MenuControlledCloseTest from './menu-controlled-close-test.svelte';
import { expectNoFalseFocusAttributes } from '../../test-utils/focus-contract';

function queryMenus() {
	return document.querySelectorAll('[role="menu"]');
}

function queryMenu() {
	return document.querySelector('[role="menu"]') as HTMLElement | null;
}

/** Counts only menus that are logically open (a closing submenu lingers in the DOM
 *  during its exit phase, so mounted-count can't distinguish open from closing). */
function openMenuCount() {
	return document.querySelectorAll('[role="menu"][data-state="open"]').length;
}

function highlightedText() {
	return document.querySelector('[role="menuitem"][data-highlighted]')?.textContent?.trim();
}

/** Derives pointer paths relative to the actual submenu position (which may flip sides). */
function submenuGeometry(root: HTMLElement, submenu: HTMLElement) {
	const rr = root.getBoundingClientRect();
	const sr = submenu.getBoundingClientRect();
	const onRight = sr.left >= rr.right - 2;
	const dir = onRight ? 1 : -1; // submenu lies toward +x (right) or -x (left)
	const nearX = onRight ? sr.left : sr.right;
	const midY = (sr.top + sr.bottom) / 2;
	return {
		// Trajectory heading toward the submenu's near edge.
		aimApex: { x: nearX - dir * 80, y: midY },
		aimEnter: { x: nearX - dir * 8, y: midY },
		// Trajectory heading away from the submenu.
		awayApex: { x: nearX - dir * 100, y: midY },
		awayEnter: { x: nearX - dir * 300, y: midY }
	};
}

function move(el: HTMLElement, p: { x: number; y: number }) {
	el.dispatchEvent(new PointerEvent('pointermove', { clientX: p.x, clientY: p.y, bubbles: true }));
}

function enter(el: Element, p: { x: number; y: number }) {
	el.dispatchEvent(new PointerEvent('pointerenter', { clientX: p.x, clientY: p.y }));
}

async function openWithSubmenu(screen: ReturnType<typeof render>) {
	await screen.getByRole('button', { name: 'Open Menu' }).click();
	await expect.poll(() => queryMenu()).toBeTruthy();
	await screen.getByRole('menuitem', { name: 'More actions' }).click();
	await expect.poll(() => queryMenus().length).toBe(2);

	const submenu = Array.from(queryMenus()).find((m) =>
		m.textContent?.includes('Archive')
	) as HTMLElement;
	const root = Array.from(queryMenus()).find(
		(m) => !m.textContent?.includes('Archive')
	) as HTMLElement;
	await expect.poll(() => submenu.getBoundingClientRect().width).toBeGreaterThan(0);
	return { submenu, root, geo: submenuGeometry(root, submenu) };
}

describe('Menu', () => {
	afterEach(() => {
		queryMenus().forEach((m) => m.remove());
		document.querySelectorAll('[role="dialog"]').forEach((d) => d.remove());
	});

	describe('Trigger + Content', () => {
		it('exposes menu button semantics on the trigger', async () => {
			const screen = render(MenuTest);
			const trigger = screen.getByRole('button', { name: 'Open Menu' });

			await expect.element(trigger).toHaveAttribute('aria-haspopup', 'menu');
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'false');
		});

		it('is closed by default and opens on trigger click', async () => {
			const screen = render(MenuTest);
			expect(queryMenu()).toBeNull();

			const trigger = screen.getByRole('button', { name: 'Open Menu' });
			await trigger.click();

			await expect.poll(() => queryMenu()).toBeTruthy();
			await expect.element(trigger).toHaveAttribute('aria-expanded', 'true');
		});

		it('renders menuitem, separator and group roles with an accessible label', async () => {
			const screen = render(MenuTest);
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const menu = queryMenu()!;
			expect(menu.getAttribute('aria-orientation')).toBe('vertical');
			expect(menu.querySelectorAll('[role="menuitem"]').length).toBeGreaterThanOrEqual(3);
			expect(menu.querySelector('[role="separator"]')).toBeTruthy();

			const group = menu.querySelector('[role="group"]') as HTMLElement;
			const labelId = group.getAttribute('aria-labelledby');
			expect(labelId).toBeTruthy();
			expect(menu.querySelector(`#${labelId}`)?.textContent).toBe('Share');
		});
	});

	describe('Selection', () => {
		it('invokes onAction and closes the menu on item activation', async () => {
			const onAction = vi.fn();
			const screen = render(MenuTest, { onAction });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			await screen.getByRole('menuitem', { name: 'Edit' }).click();

			expect(onAction).toHaveBeenCalledWith('edit');
			await expect.poll(() => queryMenu()).toBeNull();
		});

		it('keeps the menu open when closeOnSelect is false', async () => {
			const onAction = vi.fn();
			const screen = render(MenuTest, { onAction, closeOnSelect: false });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			await screen.getByRole('menuitem', { name: 'Edit' }).click();

			expect(onAction).toHaveBeenCalledWith('edit');
			expect(queryMenu()).toBeTruthy();
		});

		it('does not activate disabled items', async () => {
			const onAction = vi.fn();
			const screen = render(MenuTest, { onAction });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const disabled = screen.getByRole('menuitem', { name: 'Duplicate' });
			await expect.element(disabled).toHaveAttribute('aria-disabled', 'true');
			// Bypass Playwright actionability (which blocks aria-disabled) with a raw DOM click.
			disabled.element().dispatchEvent(new MouseEvent('click', { bubbles: true }));

			expect(onAction).not.toHaveBeenCalled();
			expect(queryMenu()).toBeTruthy();
		});
	});

	describe('Keyboard', () => {
		it('opens with ArrowDown and highlights the first enabled item', async () => {
			const screen = render(MenuTest);
			const trigger = screen.getByRole('button', { name: 'Open Menu' });
			trigger.element().focus();

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => queryMenu()).toBeTruthy();

			await expect
				.poll(() => document.querySelector('[role="menuitem"][data-highlighted]')?.textContent)
				.toBe('Edit');
		});

		it('closes on Escape and returns focus to the trigger', async () => {
			const screen = render(MenuTest);
			const trigger = screen.getByRole('button', { name: 'Open Menu' });
			await trigger.click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			await userEvent.keyboard('{Escape}');

			await expect.poll(() => queryMenu()).toBeNull();
			await expect.poll(() => document.activeElement).toBe(trigger.element());
			expectNoFalseFocusAttributes();
		});

		it('moves focus past the trigger and closes the chain on Tab', async () => {
			const screen = render(MenuTest, { withSubmenu: true });
			await openWithSubmenu(screen);

			await userEvent.keyboard('{Tab}');

			await expect.poll(() => openMenuCount()).toBe(0);
			// Focus must continue to the trigger's natural successor, not fall off the
			// portalled menu content at the end of the document.
			await expect
				.poll(() => (document.activeElement as HTMLElement | null)?.textContent?.trim())
				.toBe('After');

			// Park the real cursor on a neutral spot (the clicks above left it where menu
			// items render, and later menus opening under it would get hover-highlighted).
			await screen.getByRole('button', { name: 'After' }).hover();
		});

		it('keeps the highlight when a close is cancelled by the consumer', async () => {
			const screen = render(MenuTest, {
				onOpenChange: (open, details) => {
					if (!open) details.cancel();
				}
			});
			const trigger = screen.getByRole('button', { name: 'Open Menu' });
			trigger.element().focus();

			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => queryMenu()).toBeTruthy();
			await expect.poll(highlightedText).toBe('Edit');

			await userEvent.keyboard('{Escape}');

			// The cancelled close must not clear the interaction state as a side effect.
			expect(openMenuCount()).toBe(1);
			await expect.poll(highlightedText).toBe('Edit');
		});

		it('skips disabled items while navigating', async () => {
			const screen = render(MenuTest);
			const trigger = screen.getByRole('button', { name: 'Open Menu' });
			trigger.element().focus();

			await userEvent.keyboard('{ArrowDown}'); // Edit
			await expect.poll(() => queryMenu()).toBeTruthy();
			await userEvent.keyboard('{ArrowDown}'); // skips disabled Duplicate -> Copy link

			await expect
				.poll(() => document.querySelector('[role="menuitem"][data-highlighted]')?.textContent)
				.toBe('Copy link');
		});
	});

	describe('Loop', () => {
		// Enabled items in order: Edit, Copy link, Delete (Duplicate is disabled and skipped).
		async function openAndHighlightFirst(loop: boolean) {
			const screen = render(MenuTest, { loop });
			const trigger = screen.getByRole('button', { name: 'Open Menu' });
			trigger.element().focus();
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(() => queryMenu()).toBeTruthy();
			await expect.poll(highlightedText).toBe('Edit');
			return screen;
		}

		it('does not wrap past the last item when loop is false', async () => {
			await openAndHighlightFirst(false);

			await userEvent.keyboard('{ArrowDown}'); // Copy link
			await expect.poll(highlightedText).toBe('Copy link');
			await userEvent.keyboard('{ArrowDown}'); // Delete (last)
			await expect.poll(highlightedText).toBe('Delete');
			await userEvent.keyboard('{ArrowDown}'); // stays on Delete

			await expect.poll(highlightedText).toBe('Delete');
		});

		it('does not wrap before the first item when loop is false', async () => {
			await openAndHighlightFirst(false);

			await userEvent.keyboard('{ArrowUp}'); // stays on Edit

			await expect.poll(highlightedText).toBe('Edit');
		});

		it('wraps from last to first when loop is true', async () => {
			await openAndHighlightFirst(true);

			await userEvent.keyboard('{ArrowDown}'); // Copy link
			await userEvent.keyboard('{ArrowDown}'); // Delete (last)
			await expect.poll(highlightedText).toBe('Delete');
			await userEvent.keyboard('{ArrowDown}'); // wraps to Edit

			await expect.poll(highlightedText).toBe('Edit');
		});

		it('wraps from first to last when loop is true', async () => {
			await openAndHighlightFirst(true);

			await userEvent.keyboard('{ArrowUp}'); // wraps to Delete

			await expect.poll(highlightedText).toBe('Delete');
		});

		it('stops wrapping immediately when loop changes from true to false (reactive)', async () => {
			const screen = await openAndHighlightFirst(true);

			// With loop on, ArrowUp from the first item wraps to the last.
			await userEvent.keyboard('{ArrowUp}');
			await expect.poll(highlightedText).toBe('Delete');

			// Turn loop off on the same open menu instance.
			await screen.rerender({ loop: false });

			// From the last item, ArrowDown must no longer wrap back to the first.
			await userEvent.keyboard('{ArrowDown}');
			await expect.poll(highlightedText).toBe('Delete');
		});
	});

	describe('Typeahead', () => {
		async function openByPointer(typeahead = true) {
			const screen = render(MenuTest, { typeahead });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();
			return screen;
		}

		it('highlights the item whose text starts with the typed character', async () => {
			await openByPointer();

			await userEvent.keyboard('c');

			await expect.poll(highlightedText).toBe('Copy link');
		});

		it('prefers textValue over the rendered text content', async () => {
			await openByPointer();

			// "Delete" declares textValue="Remove", so "r" matches it and "d" must not.
			await userEvent.keyboard('r');
			await expect.poll(highlightedText).toBe('Delete');
		});

		it('does nothing when typeahead is disabled', async () => {
			await openByPointer(false);
			const before = highlightedText();

			await userEvent.keyboard('c');

			await new Promise((resolve) => setTimeout(resolve, 50));
			expect(highlightedText()).not.toBe('Copy link');
			expect(highlightedText()).toBe(before);
		});
	});

	describe('Submenu', () => {
		it('opens a submenu via the submenu trigger and selects a nested item', async () => {
			const onAction = vi.fn();
			const screen = render(MenuTest, { onAction, withSubmenu: true });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const submenuTrigger = screen.getByRole('menuitem', { name: 'More actions' });
			await expect.element(submenuTrigger).toHaveAttribute('aria-haspopup', 'menu');
			await submenuTrigger.click();

			await expect.poll(() => queryMenus().length).toBe(2);

			await screen.getByRole('menuitem', { name: 'Archive' }).click();
			expect(onAction).toHaveBeenCalledWith('archive');
			await expect.poll(() => queryMenus().length).toBe(0);
		});

		it('keeps a submenu on screen when it fits on neither side of its trigger', async () => {
			// Submenus open `right-start` and flip to `left-start`. Both are horizontal
			// placements, where `shift`'s main axis is vertical — so the middleware that
			// normally rescues an over-wide dropdown does nothing horizontally, and a
			// panel too wide for either side was left wherever the placement put it,
			// which for `left-start` is off the left edge of the screen entirely.
			// Sized through a class, not a `style` prop: `Menu.Content` spreads its rest
			// props after its own `style`, so passing one drops `position: fixed` and
			// takes the panel out of the positioning system entirely — which satisfies
			// these assertions for the wrong reason. Widening it after mount is no good
			// either: the panel grows from its existing origin without a reposition, so
			// the numbers come out identical whatever the middleware does.
			const style = document.createElement('style');
			style.textContent = '.hk-wide-submenu { min-width: 90vw; }';
			document.head.append(style);

			try {
				const screen = render(MenuTest, { withSubmenu: true, submenuClass: 'hk-wide-submenu' });
				const { submenu } = await openWithSubmenu(screen);

				await expect
					.poll(() => submenu.getBoundingClientRect().width)
					.toBeGreaterThan(window.innerWidth / 2);

				const rect = submenu.getBoundingClientRect();
				expect(rect.left).toBeGreaterThanOrEqual(0);
				expect(rect.right).toBeLessThanOrEqual(window.innerWidth);
			} finally {
				style.remove();
			}
		});

		it('keeps the submenu open while the pointer travels toward it, then closes after the grace period', async () => {
			const screen = render(MenuTest, { withSubmenu: true });
			const { root, geo } = await openWithSubmenu(screen);

			// Pointer trajectory aimed at the submenu's near edge (diagonal move).
			move(root, geo.aimApex);
			enter(screen.getByRole('menuitem', { name: 'Delete' }).element(), geo.aimEnter);

			// Deferred: the submenu stays open through the grace period (not closed on cross).
			await new Promise((resolve) => setTimeout(resolve, 150));
			expect(openMenuCount()).toBe(2);
			// But it closes once the grace period fully elapses without reaching the submenu.
			await expect.poll(() => openMenuCount(), { timeout: 2000 }).toBe(1);
		});

		it('cancels the pending close when the pointer reaches the submenu', async () => {
			const screen = render(MenuTest, { withSubmenu: true });
			const { submenu, root, geo } = await openWithSubmenu(screen);

			move(root, geo.aimApex);
			enter(screen.getByRole('menuitem', { name: 'Delete' }).element(), geo.aimEnter);

			// Pointer arrives at the submenu before the grace timer fires.
			submenu.dispatchEvent(new PointerEvent('pointerenter'));

			// Wait past the grace period; the submenu must remain open.
			await new Promise((resolve) => setTimeout(resolve, 400));
			expect(openMenuCount()).toBe(2);
		});

		it('closes the submenu before the grace period when the pointer is not aimed at it', async () => {
			const screen = render(MenuTest, { withSubmenu: true });
			const { root, geo } = await openWithSubmenu(screen);

			// Pointer moving away from the submenu closes it immediately (no grace deferral),
			// so it must be closed well before the 300ms grace window.
			move(root, geo.awayApex);
			enter(screen.getByRole('menuitem', { name: 'Delete' }).element(), geo.awayEnter);

			await expect.poll(() => openMenuCount(), { timeout: 200, interval: 16 }).toBe(1);
		});

		it('activates the hovered sibling with Enter after hover-closing the submenu', async () => {
			const onAction = vi.fn();
			const screen = render(MenuTest, { onAction, withSubmenu: true });
			const { root, geo } = await openWithSubmenu(screen);

			// Hover a sibling item while moving away from the submenu → the submenu closes
			// immediately and the sibling becomes the highlighted, focused item.
			move(root, geo.awayApex);
			enter(screen.getByRole('menuitem', { name: 'Delete' }).element(), geo.awayEnter);
			await expect.poll(() => openMenuCount()).toBe(1);
			await expect.poll(highlightedText).toBe('Delete');

			// Give any (buggy) scheduled trigger refocus a chance to run before pressing Enter.
			await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

			await userEvent.keyboard('{Enter}');

			// Enter must activate the highlighted sibling, not refocus/reopen the closed submenu.
			expect(onAction).toHaveBeenCalledWith('delete');
			await expect.poll(() => openMenuCount()).toBe(0);
		});

		it('notifies onOpenChange exactly once when the submenu opens via keyboard', async () => {
			const onSubmenuOpenChange = vi.fn();
			const screen = render(MenuTest, { withSubmenu: true, onSubmenuOpenChange });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const submenuTrigger = screen.getByRole('menuitem', { name: 'More actions' });
			submenuTrigger.element().focus();
			await userEvent.keyboard('{Enter}');

			await expect.poll(() => queryMenus().length).toBe(2);
			expect(onSubmenuOpenChange.mock.calls.filter(([open]) => open === true)).toHaveLength(1);
		});

		it('does not re-notify onOpenChange when the pointer re-enters the open submenu trigger', async () => {
			const onSubmenuOpenChange = vi.fn();
			const screen = render(MenuTest, { withSubmenu: true, onSubmenuOpenChange });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const submenuTrigger = screen
				.getByRole('menuitem', { name: 'More actions' })
				.element() as HTMLElement;
			submenuTrigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
			await expect.poll(() => queryMenus().length).toBe(2);

			// Leaving and re-entering the trigger of the already-open submenu is a no-op.
			submenuTrigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
			await new Promise((resolve) => setTimeout(resolve, 50));

			expect(queryMenus().length).toBe(2);
			expect(onSubmenuOpenChange.mock.calls.filter(([open]) => open === true)).toHaveLength(1);
		});

		it('does not open the submenu when the pointer only crosses the trigger', async () => {
			const screen = render(MenuTest, { withSubmenu: true });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const submenuTrigger = screen
				.getByRole('menuitem', { name: 'More actions' })
				.element() as HTMLElement;

			// Pointer enters and leaves before the hover-intent delay elapses.
			submenuTrigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));
			submenuTrigger.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true }));

			await new Promise((resolve) => setTimeout(resolve, 250));
			expect(openMenuCount()).toBe(1);
		});

		it('opens the submenu on hover only after the hover-intent delay', async () => {
			const screen = render(MenuTest, { withSubmenu: true });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const submenuTrigger = screen
				.getByRole('menuitem', { name: 'More actions' })
				.element() as HTMLElement;
			submenuTrigger.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true }));

			// Not opened synchronously on pointerenter (hover intent pending)…
			expect(openMenuCount()).toBe(1);
			// …but it does open once the delay elapses with the pointer still on the trigger.
			await expect.poll(() => openMenuCount(), { timeout: 2000 }).toBe(2);
		});

		it('keeps the submenu open while the pointer keeps aiming at it past the grace period', async () => {
			const screen = render(MenuTest, { withSubmenu: true });
			const { root, geo } = await openWithSubmenu(screen);
			const towardSubmenu = Math.sign(geo.aimEnter.x - geo.aimApex.x);

			move(root, geo.aimApex);
			enter(screen.getByRole('menuitem', { name: 'Delete' }).element(), geo.aimEnter);

			// The diagonal takes longer than the 300ms grace period, but every move keeps
			// aiming at the submenu: each one must re-arm the grace timer.
			for (let step = 1; step <= 10; step += 1) {
				await new Promise((resolve) => setTimeout(resolve, 50));
				move(root, {
					x: geo.aimEnter.x + towardSubmenu * step * 0.5,
					y: geo.aimEnter.y
				});
			}
			expect(openMenuCount()).toBe(2);

			// Once the pointer stops, the grace timer finally expires and the submenu closes.
			await expect.poll(() => openMenuCount(), { timeout: 2000 }).toBe(1);
		});

		it('closes only the submenu on ArrowLeft', async () => {
			const onSubmenuOpenChange = vi.fn();
			const screen = render(MenuTest, { withSubmenu: true, onSubmenuOpenChange });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const submenuTrigger = screen.getByRole('menuitem', { name: 'More actions' });
			submenuTrigger.element().focus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => queryMenus().length).toBe(2);

			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => queryMenus().length).toBe(1);

			// Consumers must not be told Escape was pressed: the internal 'submenu-back'
			// reason canonicalizes to 'imperative-action'.
			const closeCall = onSubmenuOpenChange.mock.calls.find(([open]) => open === false);
			expect(closeCall?.[1]?.reason).toBe('imperative-action');

			// Focus still returns to the submenu trigger, exactly like an Escape.
			await expect.poll(() => document.activeElement).toBe(submenuTrigger.element());
		});
	});

	describe('Interactive (non-menuitem) content', () => {
		function menuInput() {
			return document.querySelector('[data-testid="menu-input"]') as HTMLInputElement | null;
		}

		it('lets an embedded input receive typed text (including spaces) instead of hijacking keys', async () => {
			const screen = render(MenuRichContentTest);
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => menuInput()).toBeTruthy();

			const input = menuInput()!;
			input.focus();
			// Space and Enter must reach the input; the menu's keyboard nav (which otherwise
			// preventDefaults them) must not act while focus sits on a non-menuitem element.
			await userEvent.keyboard('a b');

			expect(input.value).toBe('a b');
			expect(document.activeElement).toBe(input);
			expect(openMenuCount()).toBe(1);
		});

		it('stays open when its focused content is swapped (focus falls back to <body>)', async () => {
			const screen = render(MenuRichContentTest);
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => menuInput()).toBeTruthy();

			// Activating this button unmounts it, handing focus to <body>. That transient focus
			// loss must not be treated as an intentional focus-out that closes the menu.
			await screen.getByRole('button', { name: 'Go to panel' }).click();

			await expect.poll(() => document.querySelector('[data-testid="second-panel"]')).toBeTruthy();
			expect(openMenuCount()).toBe(1);
		});

		it('stays open when focus moves into a nested portalled popover', async () => {
			const screen = render(MenuRichContentTest);
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => menuInput()).toBeTruthy();

			await screen.getByRole('button', { name: 'Open nested' }).click();
			await expect.poll(() => document.querySelector('[role="dialog"]')).toBeTruthy();

			const nested = document.querySelector('[data-testid="nested-input"]') as HTMLElement;
			nested.focus();

			// Focus landing in the nested dialog (a top layer spawned from the menu) is "inside".
			await expect.poll(() => openMenuCount()).toBe(1);
			expect(document.activeElement).toBe(nested);
		});

		it('releases a focused descendant before the menu becomes aria-hidden on controlled close', async () => {
			const screen = render(MenuControlledCloseTest);
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => menuInput()).toBeTruthy();

			const input = menuInput()!;
			input.focus();
			expect(document.activeElement).toBe(input);

			// Closing via the bound `open` (the Apply button) must not leave focus inside the
			// menu when it flips to aria-hidden/inert.
			await screen.getByRole('button', { name: 'Apply' }).click();

			const exitingMenu = queryMenu()!;
			await expect.poll(() => exitingMenu.getAttribute('data-exiting')).toBe('true');
			expect(exitingMenu.getAttribute('aria-hidden')).toBe('true');
			expect(exitingMenu.contains(document.activeElement)).toBe(false);
		});
	});

	describe('Pressed State', () => {
		it('has data-pressed while the pointer is held on an item', async () => {
			const screen = render(MenuTest);
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const item = screen.getByRole('menuitem', { name: 'Edit' }).element() as HTMLElement;
			item.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, button: 0, buttons: 1, pointerId: 1 })
			);

			await expect.poll(() => item.getAttribute('data-pressed')).toBe('true');

			item.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerId: 1 }));

			await expect.poll(() => item.getAttribute('data-pressed')).toBeNull();
		});

		it('keeps pointer press state tied to the item that started the press', async () => {
			const screen = render(MenuTest);
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const first = screen.getByRole('menuitem', { name: 'Edit' }).element() as HTMLElement;
			const second = screen.getByRole('menuitem', { name: 'Copy link' }).element() as HTMLElement;
			const pointerId = 1;

			first.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, button: 0, buttons: 1, pointerId })
			);
			await expect.poll(() => first.getAttribute('data-pressed')).toBe('true');

			first.dispatchEvent(
				new PointerEvent('pointerleave', { bubbles: true, buttons: 1, pointerId })
			);
			await expect.poll(() => first.getAttribute('data-pressed')).toBeNull();

			// Arriving on a sibling with the button still held must not light it up — the press
			// belongs to the item it began on.
			second.dispatchEvent(
				new PointerEvent('pointerenter', { bubbles: true, buttons: 1, pointerId })
			);
			expect(second.getAttribute('data-pressed')).toBeNull();

			// Returning to the originating item restores its pressed look.
			first.dispatchEvent(
				new PointerEvent('pointerenter', { bubbles: true, buttons: 1, pointerId })
			);
			await expect.poll(() => first.getAttribute('data-pressed')).toBe('true');

			window.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, button: 0, pointerId }));
			await expect.poll(() => first.getAttribute('data-pressed')).toBeNull();
		});

		it('never marks a disabled item as pressed', async () => {
			const screen = render(MenuTest);
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const disabled = screen.getByRole('menuitem', { name: 'Duplicate' }).element() as HTMLElement;
			disabled.dispatchEvent(
				new PointerEvent('pointerdown', { bubbles: true, button: 0, buttons: 1, pointerId: 1 })
			);

			expect(disabled.getAttribute('data-pressed')).toBeNull();
		});
	});
});
