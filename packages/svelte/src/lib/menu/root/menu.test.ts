import { describe, it, expect, afterEach, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { userEvent } from 'vitest/browser';
import MenuTest from './menu-test.svelte';
import MenuRichContentTest from './menu-rich-content-test.svelte';
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
		it('invokes onSelect and closes the menu on item activation', async () => {
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

		it('closes only the submenu on ArrowLeft', async () => {
			const screen = render(MenuTest, { withSubmenu: true });
			await screen.getByRole('button', { name: 'Open Menu' }).click();
			await expect.poll(() => queryMenu()).toBeTruthy();

			const submenuTrigger = screen.getByRole('menuitem', { name: 'More actions' });
			submenuTrigger.element().focus();
			await userEvent.keyboard('{ArrowRight}');
			await expect.poll(() => queryMenus().length).toBe(2);

			await userEvent.keyboard('{ArrowLeft}');
			await expect.poll(() => queryMenus().length).toBe(1);
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

			first.dispatchEvent(new PointerEvent('pointerleave', { bubbles: true, buttons: 1, pointerId }));
			await expect.poll(() => first.getAttribute('data-pressed')).toBeNull();

			// Arriving on a sibling with the button still held must not light it up — the press
			// belongs to the item it began on.
			second.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, buttons: 1, pointerId }));
			expect(second.getAttribute('data-pressed')).toBeNull();

			// Returning to the originating item restores its pressed look.
			first.dispatchEvent(new PointerEvent('pointerenter', { bubbles: true, buttons: 1, pointerId }));
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
