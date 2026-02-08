import { setContext, getContext } from 'svelte';
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
	/** Set of disabled item IDs. */
	disabledIds: Set<string | number>;

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

	/** Subscribes to selection changes for a specific item. Returns unsubscribe function. */
	subscribeToItem: (id: string | number, callback: (selected: boolean) => void) => () => void;
	/** Subscribes to focus changes for a specific item. Returns unsubscribe function. */
	subscribeToFocus: (id: string | number, callback: (focused: boolean) => void) => () => void;
	/** Returns the next item ID respecting loop setting, or null if at end. */
	getNextItemId: (currentId: string | number | null) => string | number | null;
	/** Returns the previous item ID respecting loop setting, or null if at start. */
	getPreviousItemId: (currentId: string | number | null) => string | number | null;
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
	/** Initial set of disabled item IDs. */
	disabledIds?: Iterable<string | number>;
	/** Initial selection for uncontrolled mode. */
	initialSelection?: Set<string | number>;
	/** Callback fired when selection changes. */
	onSelectionChange?: (selection: Set<string | number>) => void;
};

export function createListBoxContext(options: CreateListBoxContextOptions = {}): ListBoxContext {
	const {
		selectionMode = 'single',
		selectionBehavior = 'toggle',
		disabledIds: initialDisabledIds,
		initialSelection = new Set(),
		onSelectionChange
	} = options;

	const disabledIds = new Set(initialDisabledIds ?? []);
	const items = new Map<string | number, { textValue?: string; element?: HTMLElement }>();

	let selectedKeys = new Set<string | number>(initialSelection);
	const itemCallbacks = new Map<string | number, Set<(selected: boolean) => void>>();

	// Item count tracking with subscription
	const itemCountCallbacks = new Set<(count: number) => void>();

	function notifyItemCountChange() {
		const count = items.size;
		itemCountCallbacks.forEach((cb) => cb(count));
	}

	function registerItem(id: string | number, textValue?: string, element?: HTMLElement) {
		items.set(id, { textValue, element });
		notifyItemCountChange();
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
		return disabledIds.has(id);
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

	function getFocusedId(): string | number | null {
		return focusedId;
	}

	function isFocused(id: string | number): boolean {
		return focusedId === id || String(focusedId) === String(id);
	}

	function notifyFocus(id: string | number, focused: boolean) {
		const callbacks = focusCallbacks.get(id);
		if (callbacks) {
			callbacks.forEach((cb) => cb(focused));
		}
	}

	function setFocusedId(newId: string | number | null) {
		if (focusedId === newId) return;

		const previousId = focusedId;
		focusedId = newId;

		if (previousId !== null) {
			notifyFocus(previousId, false);
		}
		if (newId !== null) {
			notifyFocus(newId, true);
		}
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

	function select(id: string | number) {
		if (isDisabled(id)) return;

		const wasSelected = selectedKeys.has(id);
		const previouslySelected = new Set(selectedKeys);

		if (selectionMode === 'single') {
			if (selectionBehavior === 'toggle') {
				selectedKeys = wasSelected ? new Set() : new Set([id]);
			} else {
				selectedKeys = new Set([id]);
			}
		} else {
			selectedKeys = new Set(selectedKeys);
			if (selectionBehavior === 'toggle') {
				if (wasSelected) {
					selectedKeys.delete(id);
				} else {
					selectedKeys.add(id);
				}
			} else {
				selectedKeys.add(id);
			}
		}

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

		onSelectionChange?.(new Set(selectedKeys));
	}

	function selectAll() {
		if (selectionMode !== 'multiple') return;

		const enabledIds = getItemIds().filter((id) => !isDisabled(id));
		const previouslySelected = new Set(selectedKeys);
		selectedKeys = new Set(enabledIds);

		enabledIds.forEach((id) => {
			if (!previouslySelected.has(id)) {
				notifyItem(id, true);
			}
		});

		onSelectionChange?.(new Set(selectedKeys));
	}

	function setSelection(newSelection: Set<string | number>) {
		const previouslySelected = new Set(selectedKeys);
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

	// Navigation helper functions for virtual focus (used by ComboBox)
	const loop = false; // Same as keyboardNav loop setting

	function getNextItemId(currentId: string | number | null): string | number | null {
		const itemIdsList = getItemIds();
		if (itemIdsList.length === 0) return null;

		const currentIndex = currentId !== null ? itemIdsList.indexOf(currentId) : -1;

		if (currentIndex < itemIdsList.length - 1) {
			return itemIdsList[currentIndex + 1];
		}

		// At end - loop or stay
		return loop ? itemIdsList[0] : null;
	}

	function getPreviousItemId(currentId: string | number | null): string | number | null {
		const itemIdsList = getItemIds();
		if (itemIdsList.length === 0) return null;

		const currentIndex = currentId !== null ? itemIdsList.indexOf(currentId) : itemIdsList.length;

		if (currentIndex > 0) {
			return itemIdsList[currentIndex - 1];
		}

		// At start - loop or stay
		return loop ? itemIdsList[itemIdsList.length - 1] : null;
	}

	const keyboardNav = createKeyboardNavigation({
		orientation: 'vertical',
		loop: loop,
		itemSelector: '[data-navigation-item]:not([data-disabled])',
		onSelect: (id) => {
			select(id);
		},
		onFocusChange: (id) => {
			setFocusedId(id);
		},
		onSelectAll: selectionMode === 'multiple' ? selectAll : undefined,
		homeEndKeys: true
	});

	const ctx: ListBoxContext = {
		selectionMode,
		selectionBehavior,
		disabledIds,
		getSelectedKeys,
		getFocusedId,
		isSelected,
		isDisabled,
		isFocused,
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
		subscribeToItem,
		subscribeToFocus,
		getNextItemId,
		getPreviousItemId
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
