import { setContext, getContext } from 'svelte';
import type { KeyboardNavigationReturn } from '../../primitives/keyboard-navigation';

export type MenuCanonicalCloseReason =
	'escape-key' | 'outside-press' | 'focus-out' | 'item-select' | 'imperative-action' | 'none';

export type MenuCloseReason = MenuCanonicalCloseReason;

/**
 * Close reasons accepted internally by `MenuContext.close`. These never reach consumers —
 * both are observed as the canonical `'imperative-action'` (the public union is unchanged):
 * - `'sibling-open'`: a submenu displaced by hovering a sibling item/trigger. Never refocuses
 *   the closed submenu's trigger (focus belongs to the hovered sibling).
 * - `'submenu-back'`: a submenu dismissed with ArrowLeft (back to the parent menu). DOES
 *   refocus the submenu trigger, exactly like an Escape — but without lying to consumers by
 *   reporting `'escape-key'` for a key that wasn't Escape.
 */
export type MenuInternalCloseReason = MenuCloseReason | 'sibling-open' | 'submenu-back';

export type MenuOpenReason = 'trigger-press' | 'imperative-action' | 'none';

export type MenuChangeReason = MenuOpenReason | MenuCloseReason;

/** Where focus should land when the menu content opens. */
export type MenuOpenFocusIntent = 'first' | 'last';

export type MenuOpenChangeDetails = {
	reason: MenuChangeReason;
	event?: Event;
	cancel: () => void;
	isCanceled: boolean;
};

/** Metadata stored for each registered menu item, used for selection and typeahead. */
export type MenuItemData = {
	/** Text used for typeahead matching (falls back to textContent). */
	textValue?: string;
	/** The item's DOM element. */
	element?: HTMLElement;
	/** Whether the item is disabled. */
	disabled?: boolean;
	/** Handler invoked when the item is activated. */
	onSelect?: (event?: Event) => void;
	/** Per-item override for the Root `closeOnSelect` default. */
	closeOnSelect?: boolean;
};

/**
 * Context shared between Menu components (Root, Trigger, Content, Item, ...).
 * Each Menu / Submenu level provides its own context instance.
 */
export type MenuContext = {
	/** Reason why the menu last closed. */
	closeReason: MenuCanonicalCloseReason;
	/** Whether the menu is open. */
	isOpen: boolean;
	/** Reference to the trigger element. */
	triggerRef: HTMLElement | null;
	/** Reference to the content (role="menu") element. */
	contentRef: HTMLElement | null;

	/** Whether arrow navigation wraps around the ends. */
	loop: boolean;
	/** Whether typeahead is enabled. */
	typeahead: boolean;
	/** Default `closeOnSelect` for items that don't override it. */
	closeOnSelect: boolean;

	/** Depth of this menu in a submenu chain (0 for the root menu). */
	layer: number;
	/** Parent menu context, or null for the root menu. */
	parent: MenuContext | null;

	/** Keyboard navigation controller shared with Content + Items. */
	keyboardNav: KeyboardNavigationReturn;

	/** Set the trigger ref (used by Trigger / SubmenuTrigger). */
	setTriggerRef: (el: HTMLElement | null) => void;
	/** Set the content ref (used by Content). */
	setContentRef: (el: HTMLElement | null) => void;

	/** Toggle the menu open state. */
	toggle: (reason?: MenuOpenReason, event?: Event) => void;
	/** Open the menu. */
	open: (reason?: MenuOpenReason, event?: Event) => void;
	/** Close the menu and return focus to the trigger. */
	close: (reason?: MenuInternalCloseReason, event?: Event) => void;
	/** Called when the open state changes. */
	onOpenChange: (open: boolean, details: MenuOpenChangeDetails) => void;

	/** Requests where focus should land when the content next opens. */
	requestOpenFocus: (intent: MenuOpenFocusIntent) => void;
	/** Reads and clears the pending open-focus intent. */
	consumeOpenFocus: () => MenuOpenFocusIntent | null;

	/** Registers (or updates) an item. */
	registerItem: (id: string | number, data: MenuItemData) => void;
	/** Unregisters an item. */
	unregisterItem: (id: string | number) => void;
	/**
	 * Whether the given item is currently highlighted (virtually focused).
	 *
	 * NOTE: this is a one-off, NON-reactive snapshot of `keyboardNav.state.focusedId` at call
	 * time — calling it inside a `$derived`/`$effect` will not re-run when the highlight moves.
	 * For reactive highlighting, subscribe to the `keyboardNav.state.focusedId` store instead
	 * (as `Menu.Item` does).
	 */
	isHighlighted: (id: string | number) => boolean;
	/** Activates an item: runs its `onSelect` and closes unless overridden. */
	selectItem: (id: string | number, event?: Event) => void;

	/** The currently open child submenu context, if any. */
	activeChild: MenuContext | null;
	/** Notifies this menu that a child submenu opened (closes any previous one). */
	notifyChildOpen: (child: MenuContext) => void;
	/** Notifies this menu that a child submenu closed. */
	notifyChildClose: (child: MenuContext) => void;
	/** Closes the currently open child submenu, if any. */
	closeActiveChild: () => void;

	/** Records pointer movement over the content (drives submenu "safe triangle" intent). */
	trackPointer: (x: number, y: number) => void;
	/** Highlights an item from a pointer hover, deferring the close of an open submenu while
	 *  the pointer is travelling toward it. */
	highlightItemFromPointer: (id: string | number, x: number, y: number) => void;
	/** Cancels a pending deferred highlight (pointer reached the submenu). */
	cancelPendingHighlight: () => void;
};

const MENU_CONTEXT_KEY = Symbol('menu');

export function setMenuContext(ctx: MenuContext) {
	setContext(MENU_CONTEXT_KEY, ctx);
}

export function getMenuContext(): MenuContext | undefined {
	return getContext<MenuContext>(MENU_CONTEXT_KEY);
}

export function useMenuContext(part: string): MenuContext {
	const ctx = getMenuContext();
	if (!ctx) {
		throw new Error(`${part} must be used inside a Menu.Root`);
	}
	return ctx;
}
