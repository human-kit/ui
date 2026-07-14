import { setContext, getContext } from 'svelte';
import { SvelteSet } from 'svelte/reactivity';
import {
	createKeyboardNavigation,
	type KeyboardNavigationReturn
} from '../../primitives/keyboard-navigation';

/**
 * Context object shared between ListBox and ListBox.Item components.
 * Provides state management and actions for selection and focus.
 */
export type ListBoxContext = {
	/** Current selection mode. */
	selectionMode: 'single' | 'multiple';
	/** Current selection behavior. */
	selectionBehavior: 'toggle' | 'replace';
	/** Set of disabled item keys. */
	disabledKeys: Set<string | number>;

	/** Returns a copy of the currently selected keys. */
	getSelectedKeys: () => Set<string | number>;
	/** Returns the currently focused item ID. */
	getFocusedId: () => string | number | null;
	/** Checks if an item is selected. */
	isSelected: (id: string | number) => boolean;
	/** Checks if an item is disabled. */
	isDisabled: (id: string | number) => boolean;
	/** Checks if an item is focused. */
	isFocused: (id: string | number) => boolean;
	/** Whether keyboard focus-visible should be shown for the currently focused item. */
	getFocusVisible: () => boolean;

	/** Keyboard navigation controller from the shared primitive. */
	keyboardNav: KeyboardNavigationReturn;

	/** Map of registered items with their metadata. */
	items: Map<string | number, { textValue?: string; element?: HTMLElement }>;
	/** Registers an item in the listbox. */
	registerItem: (id: string | number, textValue?: string, element?: HTMLElement) => void;
	/** Unregisters an item from the listbox. */
	unregisterItem: (id: string | number) => void;
	/** Returns all registered item IDs. */
	getItemIds: () => (string | number)[];
	/** Returns the current item count. */
	getItemCount: () => number;
	/** Subscribes to item count changes. Returns unsubscribe function. */
	subscribeToItemCount: (callback: (count: number) => void) => () => void;

	/** Selects or toggles an item based on current mode and behavior. */
	select: (id: string | number) => void;
	/** Selects all enabled items (only works in multiple mode). */
	selectAll: () => void;
	/** Sets the selection programmatically (for controlled mode). */
	setSelection: (selection: Set<string | number>) => void;
	/** Sets the focused item ID. */
	setFocusedId: (id: string | number | null) => void;
	/** Sets whether the focused item should render keyboard focus-visible. */
	setFocusVisible: (visible: boolean) => void;

	/** Subscribes to selection changes for a specific item. Returns unsubscribe function. */
	subscribeToItem: (id: string | number, callback: (selected: boolean) => void) => () => void;
	/** Subscribes to focus changes for a specific item. Returns unsubscribe function. */
	subscribeToFocus: (id: string | number, callback: (focused: boolean) => void) => () => void;
	/** Subscribes to focus-visible state changes. Returns unsubscribe function. */
	subscribeToFocusVisible: (callback: (visible: boolean) => void) => () => void;
};

const KEY = Symbol('listbox');

/**
 * Options for creating a ListBox context.
 */
export type CreateListBoxContextOptions = {
	/** Selection mode: 'single' or 'multiple'. Default: 'single'. */
	selectionMode?: 'single' | 'multiple';
	/** Selection behavior: 'toggle' or 'replace'. Default: 'toggle'. */
	selectionBehavior?: 'toggle' | 'replace';
	/** Initial set of disabled item keys. */
	disabledKeys?: Iterable<string | number>;
	/** Whether arrow-key navigation wraps at the ends. Default false. */
	loop?: boolean;
	/** Whether typing characters moves focus to a matching item. Default false. */
	typeahead?: boolean;
	/** Initial selection for uncontrolled mode. */
	initialSelection?: Set<string | number>;
	/** Callback fired when selection changes. */
	onSelectionChange?: (selection: Set<string | number>) => void;
	/**
	 * Whether selection is controlled by the parent. When true, `select`/`selectAll`
	 * only emit `onSelectionChange` and the parent applies the new selection back
	 * down via `setSelection`.
	 */
	isControlled?: boolean;
};

export function createListBoxContext(options: CreateListBoxContextOptions = {}): ListBoxContext {
	// Read mode/behavior through the options object at each use site so that
	// getter-based options stay reactive after creation.
	const getSelectionMode = () => options.selectionMode ?? 'single';
	const getSelectionBehavior = () => options.selectionBehavior ?? 'toggle';

	// SvelteSet so runtime mutations are tracked by item-level $derived reads.
	const disabledKeys = new SvelteSet(options.disabledKeys ?? []);
	const items = new Map<string | number, { textValue?: string; element?: HTMLElement }>();

	let selectedKeys = new Set<string | number>(options.initialSelection ?? []);
	const itemCallbacks = new Map<string | number, Set<(selected: boolean) => void>>();

	// Item count tracking with subscription
	const itemCountCallbacks = new Set<(count: number) => void>();

	function notifyItemCountChange() {
		const count = items.size;
		itemCountCallbacks.forEach((cb) => cb(count));
	}

	function registerItem(id: string | number, textValue?: string, element?: HTMLElement) {
		const hadItem = items.has(id);
		items.set(id, { textValue, element });
		if (!hadItem) {
			notifyItemCountChange();
		}
	}

	function unregisterItem(id: string | number) {
		items.delete(id);
		itemCallbacks.delete(id);
		notifyItemCountChange();
	}

	function getItemCount(): number {
		return items.size;
	}

	function subscribeToItemCount(callback: (count: number) => void): () => void {
		itemCountCallbacks.add(callback);
		// Immediately call with current count
		callback(items.size);
		return () => {
			itemCountCallbacks.delete(callback);
		};
	}

	function getItemIds(): (string | number)[] {
		return Array.from(items.keys());
	}

	function isDisabled(id: string | number): boolean {
		return disabledKeys.has(id);
	}

	function isSelected(id: string | number): boolean {
		return selectedKeys.has(id);
	}

	function getSelectedKeys(): Set<string | number> {
		return new Set(selectedKeys);
	}

	function notifyItem(id: string | number, selected: boolean) {
		const callbacks = itemCallbacks.get(id);
		if (callbacks) {
			callbacks.forEach((cb) => cb(selected));
		}
	}

	let focusedId: string | number | null = null;
	const focusCallbacks = new Map<string | number, Set<(focused: boolean) => void>>();
	let focusVisible = false;
	const focusVisibleCallbacks = new Set<(visible: boolean) => void>();

	function getFocusedId(): string | number | null {
		return focusedId;
	}

	// Strict comparison, matching how selection/disabled Sets compare keys.
	// A String() coercion here made the string id "1" and the number id 1
	// indistinguishable for focus, while the Sets kept treating them as two
	// different items. Item ids are re-typed from `data-item-id-type` before
	// they reach the context, so no coercion is needed.
	function isFocused(id: string | number): boolean {
		return focusedId === id;
	}

	function getFocusVisible(): boolean {
		return focusVisible;
	}

	function setFocusedId(newId: string | number | null) {
		focusedId = newId;

		for (const [id, callbacks] of focusCallbacks) {
			// Strict comparison (see isFocused): "1" and 1 are different items.
			const focused = newId !== null && id === newId;
			callbacks.forEach((callback) => callback(focused));
		}
	}

	function setFocusVisible(visible: boolean) {
		if (focusVisible === visible) return;
		focusVisible = visible;
		focusVisibleCallbacks.forEach((callback) => callback(visible));
	}

	function subscribeToFocus(id: string | number, callback: (focused: boolean) => void): () => void {
		if (!focusCallbacks.has(id)) {
			focusCallbacks.set(id, new Set());
		}
		focusCallbacks.get(id)!.add(callback);
		callback(isFocused(id));

		return () => {
			const callbacks = focusCallbacks.get(id);
			if (callbacks) {
				callbacks.delete(callback);
				if (callbacks.size === 0) {
					focusCallbacks.delete(id);
				}
			}
		};
	}

	function subscribeToFocusVisible(callback: (visible: boolean) => void): () => void {
		focusVisibleCallbacks.add(callback);
		callback(focusVisible);

		return () => {
			focusVisibleCallbacks.delete(callback);
		};
	}

	function subscribeToItem(id: string | number, callback: (selected: boolean) => void): () => void {
		if (!itemCallbacks.has(id)) {
			itemCallbacks.set(id, new Set());
		}
		itemCallbacks.get(id)!.add(callback);
		callback(selectedKeys.has(id));

		return () => {
			const callbacks = itemCallbacks.get(id);
			if (callbacks) {
				callbacks.delete(callback);
				if (callbacks.size === 0) {
					itemCallbacks.delete(id);
				}
			}
		};
	}

	function applySelection(newSelection: Set<string | number>) {
		const previouslySelected = selectedKeys;
		selectedKeys = new Set(newSelection);

		previouslySelected.forEach((prevId) => {
			if (!selectedKeys.has(prevId)) {
				notifyItem(prevId, false);
			}
		});

		selectedKeys.forEach((newId) => {
			if (!previouslySelected.has(newId)) {
				notifyItem(newId, true);
			}
		});
	}

	function commitSelection(newSelection: Set<string | number>) {
		if (options.isControlled) {
			// Controlled mode: emit the change and let the parent push the new
			// selection back down through `setSelection`.
			options.onSelectionChange?.(new Set(newSelection));
			return;
		}

		applySelection(newSelection);
		options.onSelectionChange?.(new Set(selectedKeys));
	}

	function computeNextSelection(id: string | number): Set<string | number> {
		const wasSelected = selectedKeys.has(id);

		if (getSelectionMode() === 'single') {
			if (getSelectionBehavior() === 'toggle') {
				return wasSelected ? new Set() : new Set([id]);
			}
			return new Set([id]);
		}

		const nextSelection = new Set(selectedKeys);
		if (getSelectionBehavior() === 'toggle') {
			if (wasSelected) {
				nextSelection.delete(id);
			} else {
				nextSelection.add(id);
			}
		} else {
			nextSelection.add(id);
		}
		return nextSelection;
	}

	function select(id: string | number) {
		if (isDisabled(id)) return;

		commitSelection(computeNextSelection(id));
	}

	function selectAll() {
		if (getSelectionMode() !== 'multiple') return;

		const enabledIds = getItemIds().filter((id) => !isDisabled(id));
		commitSelection(new Set(enabledIds));
	}

	function setSelection(newSelection: Set<string | number>) {
		applySelection(newSelection);
	}

	const keyboardNav = createKeyboardNavigation({
		orientation: 'vertical',
		// Getter-based so reactive prop changes are honoured after creation.
		loop: () => options.loop ?? false,
		typeahead: () => options.typeahead ?? false,
		itemSelector: '[data-navigation-item]:not([data-disabled])',
		onSelect: (id) => {
			select(id);
		},
		onFocusChange: (id) => {
			setFocusedId(id);
		},
		// `selectAll` checks the selection mode at call time so runtime mode
		// changes are respected.
		onSelectAll: selectAll,
		homeEndKeys: true
	});

	const ctx: ListBoxContext = {
		get selectionMode() {
			return getSelectionMode();
		},
		get selectionBehavior() {
			return getSelectionBehavior();
		},
		disabledKeys,
		getSelectedKeys,
		getFocusedId,
		isSelected,
		isDisabled,
		isFocused,
		getFocusVisible,
		keyboardNav,
		items,
		registerItem,
		unregisterItem,
		getItemIds,
		getItemCount,
		subscribeToItemCount,
		select,
		selectAll,
		setSelection,
		setFocusedId,
		setFocusVisible,
		subscribeToItem,
		subscribeToFocus,
		subscribeToFocusVisible
	};

	setContext(KEY, ctx);
	return ctx;
}

export function useListBoxContext(): ListBoxContext {
	const ctx = getContext<ListBoxContext>(KEY);
	if (!ctx) {
		throw new Error('useListBoxContext must be used within a ListBox component');
	}
	return ctx;
}
