import { writable, type Writable } from 'svelte/store';

export type KeyboardNavigationOrientation = 'vertical' | 'horizontal' | 'both';

export type KeyboardNavigationOptions = {
	/**
	 * Orientation of the navigation
	 * - 'vertical': ArrowUp/ArrowDown for navigation
	 * - 'horizontal': ArrowLeft/ArrowRight for navigation
	 * - 'both': All arrow keys for navigation
	 * Accepts a getter so the value can change reactively after creation.
	 */
	orientation?: KeyboardNavigationOrientation | (() => KeyboardNavigationOrientation);

	/**
	 * Whether navigation wraps around at the ends.
	 * Accepts a getter so the value can change reactively after creation.
	 */
	loop?: boolean | (() => boolean);

	/**
	 * Selector for finding navigable items within the container.
	 * Accepts a getter so the value can change reactively after creation.
	 */
	itemSelector?: string | (() => string);

	/**
	 * Callback when an item is selected (Enter/Space)
	 */
	onSelect?: (id: string | number, element: HTMLElement) => void;

	/**
	 * Callback when focused item changes
	 */
	onFocusChange?: (id: string | number | null, element: HTMLElement | null) => void;

	/**
	 * Callback for Ctrl+A (select all)
	 */
	onSelectAll?: () => void;

	/**
	 * Whether to handle Home/End keys
	 */
	homeEndKeys?: boolean;

	/**
	 * Whether to handle typeahead (character search).
	 * Accepts a getter so the value can change reactively after creation.
	 */
	typeahead?: boolean | (() => boolean);
};

export type KeyboardNavigationState = {
	focusedId: Writable<string | number | null>;
	focusedElement: Writable<HTMLElement | null>;
};

/**
 * Every navigable container registers itself here so a parent navigation scope can tell
 * when an item (or keydown target) actually belongs to a *nested* widget. Without this, a
 * `ListBox` or another menu rendered inside a `Menu.Content` would have its options matched
 * by the parent's `itemSelector` and its keystrokes hijacked by the parent's handler.
 */
const navigationContainers = new WeakSet<HTMLElement>();

const DEFAULT_ITEM_SELECTOR = '[data-navigation-item]:not([data-disabled])';

export type KeyboardNavigationReturn = {
	/** Current state stores */
	state: KeyboardNavigationState;

	/** Svelte action to attach to container */
	action: (node: HTMLElement) => { destroy: () => void };

	/** Programmatic navigation methods */
	focusNext: () => void;
	focusPrevious: () => void;
	focusFirst: () => void;
	focusLast: () => void;
	focusById: (id: string | number) => void;
	setCurrentId: (id: string | number | null) => void;

	/** Update items (call after DOM changes) */
	updateItems: () => void;
};

/**
 * Creates a keyboard navigation controller for list-like components.
 * Implements WAI-ARIA patterns for keyboard navigation.
 *
 * @example
 * ```svelte
 * <script>
 *   import { createKeyboardNavigation } from '$lib/primitives/keyboard-navigation';
 *
 *   const { action, state, focusNext } = createKeyboardNavigation({
 *     orientation: 'vertical',
 *     onSelect: (id) => console.log('Selected:', id)
 *   });
 * </script>
 *
 * <div use:action>
 *   <div data-navigation-item data-item-id="1">Item 1</div>
 *   <div data-navigation-item data-item-id="2">Item 2</div>
 * </div>
 * ```
 */
export function createKeyboardNavigation(
	options: KeyboardNavigationOptions = {}
): KeyboardNavigationReturn {
	const { onSelect, onFocusChange, onSelectAll, homeEndKeys = true } = options;

	// `orientation`, `loop`, `itemSelector` and `typeahead` may be getters so they can change
	// reactively after creation.
	const getOrientation = () =>
		typeof options.orientation === 'function'
			? options.orientation()
			: (options.orientation ?? 'vertical');
	const getItemSelector = () =>
		typeof options.itemSelector === 'function'
			? options.itemSelector()
			: (options.itemSelector ?? DEFAULT_ITEM_SELECTOR);
	const getLoop = () =>
		typeof options.loop === 'function' ? options.loop() : (options.loop ?? false);
	const getTypeahead = () =>
		typeof options.typeahead === 'function' ? options.typeahead() : (options.typeahead ?? false);

	const focusedId = writable<string | number | null>(null);
	const focusedElement = writable<HTMLElement | null>(null);

	let container: HTMLElement | null = null;
	let items: HTMLElement[] = [];
	let typeaheadBuffer = '';
	let typeaheadTimeout: ReturnType<typeof setTimeout> | null = null;

	/** Nearest ancestor registered as a navigation container, or `null` if none. */
	function nearestNavigationContainer(element: HTMLElement): HTMLElement | null {
		let current: HTMLElement | null = element.parentElement;
		while (current) {
			if (navigationContainers.has(current)) return current;
			current = current.parentElement;
		}
		return null;
	}

	function getItems(): HTMLElement[] {
		if (!container) return [];
		const scope = container;
		// Exclude items owned by a nested navigation widget (e.g. a ListBox or another menu
		// embedded in this container's content); those have their own keyboard handling.
		return Array.from(scope.querySelectorAll<HTMLElement>(getItemSelector())).filter(
			(el) => nearestNavigationContainer(el) === scope
		);
	}

	/**
	 * Whether this controller should act on a keydown. We only drive navigation when focus is
	 * on the container itself or on one of *our* items — never when it sits on an input, a
	 * button, or an item owned by a nested widget, which must own their own keys (typing,
	 * caret movement, activation).
	 */
	function isNavigableTarget(target: EventTarget | null): boolean {
		if (!container) return false;
		if (target === container) return true;
		if (!(target instanceof HTMLElement)) return false;
		return target.matches(getItemSelector()) && nearestNavigationContainer(target) === container;
	}

	function updateItems() {
		items = getItems();
		// Note: tabIndex is now controlled by Svelte components via isFocused state
		// The primitive only manages focus() calls and notifies about focus changes
	}

	function getItemId(element: HTMLElement): string | number | null {
		const rawId = element.dataset.itemId;
		if (rawId === undefined) return null;

		const idType = element.dataset.itemIdType;
		if (idType === 'number') {
			const parsed = Number(rawId);
			return Number.isNaN(parsed) ? rawId : parsed;
		}

		return rawId;
	}

	function focusItem(element: HTMLElement | null) {
		if (!element) {
			focusedId.set(null);
			focusedElement.set(null);
			onFocusChange?.(null, null);
			return;
		}

		const id = getItemId(element);
		focusedId.set(id);
		focusedElement.set(element);

		// Note: tabIndex is controlled by Svelte via isFocused state
		// We just call focus() and notify - the component will react to onFocusChange
		element.focus();
		onFocusChange?.(id, element);
	}

	function getCurrentIndex(): number {
		// The live DOM focus wins: a native focus change (mouse click, script `.focus()`, focus
		// restoration) can move focus without going through `focusItem`, leaving the internal
		// store stale — navigating from the store would then jump from the wrong item.
		const active = document.activeElement;
		if (active instanceof HTMLElement) {
			const idx = items.indexOf(active);
			if (idx !== -1) return idx;
		}

		// Fall back to the internal store (covers virtual focus, where DOM focus sits on the
		// container rather than on an item).
		let currentElement: HTMLElement | null = null;
		focusedElement.subscribe((el) => (currentElement = el))();
		return currentElement ? items.indexOf(currentElement) : -1;
	}

	function focusNext() {
		items = getItems();
		if (items.length === 0) return;

		const currentIdx = getCurrentIndex();
		let nextIdx: number;

		if (currentIdx === -1) {
			nextIdx = 0;
		} else if (getLoop()) {
			nextIdx = (currentIdx + 1) % items.length;
		} else {
			nextIdx = Math.min(currentIdx + 1, items.length - 1);
		}

		focusItem(items[nextIdx]);
	}

	function focusPrevious() {
		items = getItems();
		if (items.length === 0) return;

		const currentIdx = getCurrentIndex();
		let prevIdx: number;

		if (currentIdx === -1) {
			prevIdx = items.length - 1;
		} else if (getLoop()) {
			prevIdx = (currentIdx - 1 + items.length) % items.length;
		} else {
			prevIdx = Math.max(currentIdx - 1, 0);
		}

		focusItem(items[prevIdx]);
	}

	function focusFirst() {
		items = getItems();
		if (items.length === 0) return;
		focusItem(items[0]);
	}

	function focusLast() {
		items = getItems();
		if (items.length === 0) return;
		focusItem(items[items.length - 1]);
	}

	function focusById(id: string | number) {
		items = getItems();
		const element = items.find((el) => {
			const itemId = getItemId(el);
			return itemId === id || String(itemId) === String(id);
		});
		if (element) {
			focusItem(element);
		}
	}

	function setCurrentId(id: string | number | null) {
		if (id === null) {
			focusedId.set(null);
			focusedElement.set(null);
			onFocusChange?.(null, null);
			return;
		}

		items = getItems();
		const element = items.find((el) => {
			const itemId = getItemId(el);
			return itemId === id || String(itemId) === String(id);
		});

		focusedId.set(id);
		focusedElement.set(element ?? null);
		onFocusChange?.(id, element ?? null);
	}

	function handleTypeahead(char: string) {
		if (!getTypeahead()) return;

		if (typeaheadTimeout) {
			clearTimeout(typeaheadTimeout);
		}

		typeaheadBuffer += char.toLowerCase();

		items = getItems();

		// APG: pressing the same character repeatedly cycles through the items starting with
		// it, so a buffer made of one repeated character collapses to a single-character search.
		const isRepeatedChar =
			typeaheadBuffer.length > 1 &&
			typeaheadBuffer.split('').every((c) => c === typeaheadBuffer[0]);
		const search = isRepeatedChar ? typeaheadBuffer[0] : typeaheadBuffer;

		// APG: the search starts AFTER the currently focused item and wraps around, so typeahead
		// cycles through matches instead of sticking on the first one. The current item stays in
		// the candidate list as the LAST entry, so a growing multi-character buffer can still
		// confirm it. With nothing focused, this is a plain first-match-from-start search.
		const currentIdx = getCurrentIndex();
		const ordered =
			currentIdx === -1
				? items
				: [...items.slice(currentIdx + 1), ...items.slice(0, currentIdx + 1)];

		const match = ordered.find((el) => {
			// Prefer an explicit text value (e.g. Menu.Item's `textValue` exposed as
			// `data-text-value`) over the rendered text content.
			const text = (el.dataset.textValue ?? el.textContent)?.trim().toLowerCase() || '';
			return text.startsWith(search);
		});

		if (match) {
			focusItem(match);
		}

		typeaheadTimeout = setTimeout(() => {
			typeaheadBuffer = '';
		}, 500);
	}

	function handleKeydown(event: KeyboardEvent) {
		// Bail when focus is on nested/interactive content so it keeps its native key behaviour.
		if (!isNavigableTarget(event.target)) return;

		const { key, ctrlKey, metaKey } = event;

		const orientation = getOrientation();

		const nextKeys =
			orientation === 'horizontal'
				? ['ArrowRight']
				: orientation === 'vertical'
					? ['ArrowDown']
					: ['ArrowDown', 'ArrowRight'];

		const prevKeys =
			orientation === 'horizontal'
				? ['ArrowLeft']
				: orientation === 'vertical'
					? ['ArrowUp']
					: ['ArrowUp', 'ArrowLeft'];

		if (nextKeys.includes(key)) {
			event.preventDefault();
			focusNext();
			return;
		}

		if (prevKeys.includes(key)) {
			event.preventDefault();
			focusPrevious();
			return;
		}

		// NOTE: key repeat is only suppressed for keys this handler actually consumes
		// (Enter/Space, below). A blanket `preventDefault` on every repeating key blocked a
		// held Tab from leaving the widget (a mini keyboard trap) and disabled Home/End repeat.

		// Home/End (repeat allowed — they're idempotent jumps)
		if (homeEndKeys) {
			if (key === 'Home') {
				event.preventDefault();
				focusFirst();
				return;
			}

			if (key === 'End') {
				event.preventDefault();
				focusLast();
				return;
			}
		}

		// Selection — consume the key (prevent page scroll on Space) but only act on the
		// initial press, so holding Enter/Space doesn't re-trigger the selection.
		if (key === 'Enter' || key === ' ') {
			event.preventDefault();
			if (event.repeat) return;

			const active = document.activeElement as HTMLElement;
			items = getItems();

			if (active && items.includes(active)) {
				const id = getItemId(active);
				if (id !== null) {
					onSelect?.(id, active);
				}
			}
			return;
		}

		// Select all (Ctrl+A / Cmd+A)
		if ((ctrlKey || metaKey) && (key === 'a' || key === 'A')) {
			if (onSelectAll) {
				event.preventDefault();
				onSelectAll();
				return;
			}
		}

		// Typeahead (single printable character)
		if (getTypeahead() && key.length === 1 && !ctrlKey && !metaKey) {
			handleTypeahead(key);
		}
	}

	function action(node: HTMLElement) {
		container = node;
		navigationContainers.add(node);
		updateItems();

		node.addEventListener('keydown', handleKeydown);

		// Handle focus on container
		function handleContainerFocus(event: FocusEvent) {
			// If focusing container directly (not an item), focus first item
			if (event.target === node) {
				// Focus moving backwards out of an item (Shift+Tab) lands on the
				// container; re-capturing it trapped keyboard users inside the
				// widget — let the browser continue past it instead.
				const related = event.relatedTarget as Node | null;
				if (related && node.contains(related)) return;
				items = getItems();
				if (items.length > 0) {
					// Focus the item with tabIndex 0 or first item
					const tabbable = items.find((el) => el.tabIndex === 0) || items[0];
					focusItem(tabbable);
				}
			}
		}

		node.addEventListener('focus', handleContainerFocus, true);

		return {
			destroy() {
				node.removeEventListener('keydown', handleKeydown);
				node.removeEventListener('focus', handleContainerFocus, true);
				navigationContainers.delete(node);
				container = null;
				if (typeaheadTimeout) {
					clearTimeout(typeaheadTimeout);
				}
			}
		};
	}

	return {
		state: {
			focusedId,
			focusedElement
		},
		action,
		focusNext,
		focusPrevious,
		focusFirst,
		focusLast,
		focusById,
		setCurrentId,
		updateItems
	};
}

/**
 * Simple Svelte action for roving tabindex without state management.
 * Use this for simpler cases where you don't need programmatic control.
 */
export function rovingTabindex(
	container: HTMLElement,
	options: Pick<KeyboardNavigationOptions, 'orientation' | 'loop' | 'itemSelector'> = {}
) {
	if (typeof document === 'undefined') {
		return {
			update: (
				_newOptions: Pick<KeyboardNavigationOptions, 'orientation' | 'loop' | 'itemSelector'> = {}
			) => {},
			destroy: () => {}
		};
	}

	// Every option is routed through a getter reading the LATEST options object, so
	// `update` (called by Svelte when the action's parameter changes) makes post-mount
	// orientation/loop/itemSelector changes effective instead of silently dropping them.
	let currentOptions = options;

	const { action, updateItems } = createKeyboardNavigation({
		orientation: () => {
			const value = currentOptions.orientation;
			return (typeof value === 'function' ? value() : value) ?? 'vertical';
		},
		loop: () => {
			const value = currentOptions.loop;
			return (typeof value === 'function' ? value() : value) ?? false;
		},
		itemSelector: () => {
			const value = currentOptions.itemSelector;
			return (typeof value === 'function' ? value() : value) ?? DEFAULT_ITEM_SELECTOR;
		}
	});
	const cleanup = action(container);

	return {
		update(
			newOptions: Pick<KeyboardNavigationOptions, 'orientation' | 'loop' | 'itemSelector'> = {}
		) {
			currentOptions = newOptions;
			updateItems();
		},
		destroy: cleanup.destroy
	};
}
