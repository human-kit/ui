import { SvelteMap } from 'svelte/reactivity';
import { createKeyboardNavigation } from '../../primitives/keyboard-navigation';
import { createSubmenuIntent } from './submenu-intent';
import {
	addTriggerBlurCleanup,
	applyTriggerCloseFocusState,
	clearTriggerFocusState
} from './focus-state';
import type {
	MenuCanonicalCloseReason,
	MenuChangeReason,
	MenuCloseReason,
	MenuContext,
	MenuInternalCloseReason,
	MenuItemData,
	MenuOpenChangeDetails,
	MenuOpenFocusIntent,
	MenuOpenReason
} from './context';

export type CreateMenuStateOptions = {
	/** Reads the controlled open value (undefined when uncontrolled). */
	getOpen: () => boolean | undefined;
	/** Writes the open value back to the bindable prop. */
	setOpen: (value: boolean) => void;
	/** Initial open state for uncontrolled mode. */
	defaultOpen: boolean;
	/** Reads the current open-change callback. */
	getOnOpenChange?: () => ((open: boolean, details: MenuOpenChangeDetails) => void) | undefined;
	getLoop: () => boolean;
	getTypeahead: () => boolean;
	getCloseOnSelect: () => boolean;
	/** Reads the externally-bound trigger ref. */
	getTriggerRef: () => HTMLElement | null;
	/** Writes the trigger ref back to the bindable prop. */
	setTriggerRefProp: (el: HTMLElement | null) => void;
	/** Parent menu context (null for the root menu). */
	parent: MenuContext | null;
	/** Depth in the submenu chain (0 for the root menu). */
	layer: number;
};

export type MenuState = {
	ctx: MenuContext;
	/** Cleans up timers and listeners. Call from onDestroy. */
	destroy: () => void;
};

/**
 * Shared open/close + navigation state machine for Menu.Root and Menu.SubmenuRoot.
 * Mirrors the Popover root behaviour while adding menu item registration and
 * keyboard navigation. Uses runes, so it must be called during component init.
 */
export function createMenuState(options: CreateMenuStateOptions): MenuState {
	let closeReason: MenuCanonicalCloseReason = $state('none');
	let contentRef: HTMLElement | null = $state(null);
	let cleanupTriggerBlurListener: (() => void) | undefined;
	let pendingTriggerCloseFocusFrame: number | undefined;

	// Capture initial value only (not reactive).
	let isOpenInternal = $state((() => options.defaultOpen)());

	const isControlled = $derived(options.getOpen() !== undefined);
	const isOpen = $derived(isControlled ? options.getOpen()! : isOpenInternal);

	const items = new SvelteMap<string | number, MenuItemData>();

	function selectItem(id: string | number, event?: Event) {
		const data = items.get(id);
		if (!data || data.disabled) return;
		data.onSelect?.(event);
		const shouldClose = data.closeOnSelect ?? options.getCloseOnSelect();
		if (shouldClose) {
			// Closing the whole menu chain on select is the expected behaviour.
			closeChain('item-select', event);
		}
	}

	const keyboardNav = createKeyboardNavigation({
		orientation: 'vertical',
		// Pass getters so loop/typeahead stay in sync with the (possibly reactive) props.
		loop: () => options.getLoop(),
		typeahead: () => options.getTypeahead(),
		homeEndKeys: true,
		itemSelector: '[data-navigation-item]:not([data-disabled])',
		onSelect: (id, element) => {
			selectItem(id, new CustomEvent('menuitemselect', { detail: { element } }));
		}
	});

	function setOpenWithDetails(
		value: boolean,
		incomingDetails: { reason: MenuChangeReason; event?: Event }
	) {
		// No-op transitions (e.g. pointer re-entering an already-open submenu trigger) must
		// not re-notify the consumer; cancel semantics only apply to real state changes.
		if (value === isOpen) return;

		let canceled = false;
		const details: MenuOpenChangeDetails = {
			reason: incomingDetails.reason,
			event: incomingDetails.event,
			cancel: () => {
				canceled = true;
			},
			get isCanceled() {
				return canceled;
			}
		};

		options.getOnOpenChange?.()?.(value, details);
		if (details.isCanceled) return;

		// Every (non-canceled) transition to open resets the stale close reason — including
		// `toggle()`, which used to leave e.g. 'escape-key' behind from the previous cycle.
		if (value) {
			closeReason = 'none';
		}

		if (!isControlled) {
			isOpenInternal = value;
		}

		options.setOpen(value);
	}

	function toggle(reason: MenuOpenReason = 'trigger-press', event?: Event) {
		setOpenWithDetails(!isOpen, { reason, event });
	}

	function openMenu(reason: MenuOpenReason = 'imperative-action', event?: Event) {
		setOpenWithDetails(true, { reason, event });
	}

	function clearPendingTriggerCloseFocus() {
		if (pendingTriggerCloseFocusFrame === undefined) return;
		cancelAnimationFrame(pendingTriggerCloseFocusFrame);
		pendingTriggerCloseFocusFrame = undefined;
	}

	function scheduleTriggerCloseFocus(
		trigger: HTMLElement,
		reason: MenuInternalCloseReason,
		event?: Event
	) {
		clearPendingTriggerCloseFocus();
		pendingTriggerCloseFocusFrame = requestAnimationFrame(() => {
			pendingTriggerCloseFocusFrame = undefined;
			if (!trigger.isConnected) return;
			applyTriggerCloseFocusState(trigger, reason, event);
		});
	}

	// Focus returns to the trigger only on deliberate keyboard/selection closes — not when
	// the user tabbed away ('focus-out'), clicked elsewhere ('outside-press') or hovered a
	// sibling that displaced the submenu ('sibling-open', where focus belongs to the sibling).
	// 'submenu-back' (ArrowLeft on a submenu) is deliberate too: focus returns to the
	// submenu's trigger in the parent menu.
	const TRIGGER_REFOCUS_REASONS: readonly MenuInternalCloseReason[] = [
		'escape-key',
		'item-select',
		'imperative-action',
		'submenu-back'
	];

	function closeMenu(reason: MenuInternalCloseReason = 'imperative-action', event?: Event) {
		// 'sibling-open' / 'submenu-back' are internal-only; consumers observe the canonical reason.
		const canonicalReason: MenuCanonicalCloseReason =
			reason === 'sibling-open' || reason === 'submenu-back' ? 'imperative-action' : reason;
		closeReason = canonicalReason;
		const wasOpen = isOpen;
		setOpenWithDetails(false, { reason: canonicalReason, event });
		if (!wasOpen || isOpen) return;
		// Clear the highlight/pending intents only once the close actually happened — a close
		// cancelled by the consumer must leave the menu's interaction state untouched.
		keyboardNav.setCurrentId(null);
		submenuIntent.cancel();
		const triggerRef = options.getTriggerRef();
		if (!triggerRef) return;
		if (!TRIGGER_REFOCUS_REASONS.includes(reason)) return;
		// The INTERNAL reason drives the trigger focus visuals ('submenu-back' styles like an
		// Escape); only the reason reported to consumers is canonicalized.
		scheduleTriggerCloseFocus(triggerRef, reason, event);
	}

	/** Closes this menu and, for selections, any ancestor menus too. */
	function closeChain(reason: MenuCloseReason, event?: Event) {
		closeMenu(reason, event);
		if (reason === 'item-select') {
			options.parent?.close(reason, event);
		}
	}

	function setTriggerRef(el: HTMLElement | null) {
		clearPendingTriggerCloseFocus();
		cleanupTriggerBlurListener?.();
		cleanupTriggerBlurListener = undefined;
		const previous = options.getTriggerRef();
		if (previous && previous !== el) {
			clearTriggerFocusState(previous);
		}
		options.setTriggerRefProp(el);
		if (!el) return;
		cleanupTriggerBlurListener = addTriggerBlurCleanup(el);
	}

	function setContentRef(el: HTMLElement | null) {
		contentRef = el;
	}

	let openFocusIntent: MenuOpenFocusIntent | null = null;

	function requestOpenFocus(intent: MenuOpenFocusIntent) {
		openFocusIntent = intent;
	}

	function consumeOpenFocus(): MenuOpenFocusIntent | null {
		const intent = openFocusIntent;
		openFocusIntent = null;
		return intent;
	}

	function handleOpenChange(newOpen: boolean, details: MenuOpenChangeDetails) {
		setOpenWithDetails(newOpen, { reason: details.reason, event: details.event });
	}

	function registerItem(id: string | number, data: MenuItemData) {
		items.set(id, data);
	}

	function unregisterItem(id: string | number) {
		items.delete(id);
	}

	let activeChild: MenuContext | null = null;
	const submenuIntent = createSubmenuIntent(() => activeChild);

	function notifyChildOpen(child: MenuContext) {
		if (activeChild && activeChild !== child) {
			activeChild.close('sibling-open');
		}
		activeChild = child;
	}

	function notifyChildClose(child: MenuContext) {
		if (activeChild === child) {
			activeChild = null;
			submenuIntent.cancel();
		}
	}

	function closeActiveChild() {
		submenuIntent.cancel();
		if (!activeChild) return;
		const child = activeChild;
		activeChild = null;
		child.close('sibling-open');
	}

	function trackPointer(x: number, y: number) {
		submenuIntent.track(x, y);
	}

	function highlightItemFromPointer(id: string | number, x: number, y: number) {
		submenuIntent.request({ x, y }, () => {
			closeActiveChild();
			keyboardNav.focusById(id);
		});
	}

	function cancelPendingHighlight() {
		submenuIntent.cancel();
	}

	function isHighlighted(id: string | number) {
		let current: string | number | null = null;
		keyboardNav.state.focusedId.subscribe((value) => (current = value))();
		return current !== null && (current === id || String(current) === String(id));
	}

	const ctx: MenuContext = {
		get closeReason() {
			return closeReason;
		},
		get isOpen() {
			return isOpen;
		},
		get triggerRef() {
			return options.getTriggerRef();
		},
		get contentRef() {
			return contentRef;
		},
		get loop() {
			return options.getLoop();
		},
		get typeahead() {
			return options.getTypeahead();
		},
		get closeOnSelect() {
			return options.getCloseOnSelect();
		},
		layer: options.layer,
		parent: options.parent,
		keyboardNav,
		setTriggerRef,
		setContentRef,
		toggle,
		open: openMenu,
		close: closeMenu,
		onOpenChange: handleOpenChange,
		requestOpenFocus,
		consumeOpenFocus,
		registerItem,
		unregisterItem,
		isHighlighted,
		selectItem,
		get activeChild() {
			return activeChild;
		},
		notifyChildOpen,
		notifyChildClose,
		closeActiveChild,
		trackPointer,
		highlightItemFromPointer,
		cancelPendingHighlight
	};

	function destroy() {
		clearPendingTriggerCloseFocus();
		cleanupTriggerBlurListener?.();
	}

	return { ctx, destroy };
}
