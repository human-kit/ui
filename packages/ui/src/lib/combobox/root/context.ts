import { setContext, getContext } from 'svelte';
import type { ListBoxContext } from '../../listbox/root/context';

export type ComboBoxFilter = (textValue: string, inputValue: string) => boolean;

export type ComboBoxItemActionSource = 'keyboard' | 'pointer';

export type ComboBoxItemActionDetails = {
	id: string | number;
	textValue: string;
	inputValue: string;
	source: ComboBoxItemActionSource;
};

export type ComboBoxItemActionHandler = (details: ComboBoxItemActionDetails) => void;

export type ComboBoxItemActionRegistration = {
	textValue: string;
	onAction: ComboBoxItemActionHandler;
	closeOnAction: boolean;
};

/**
 * Context shared between ComboBox and its children.
 */
export type ComboBoxContext<T extends object = object> = {
	/** Unique instance ID for ARIA attributes */
	instanceId: string;
	/** Current input value (used for filtering, respects shouldFilter flag) */
	inputValue: string;
	/** Display value shown in the input element (always shows actual text) */
	displayValue: string;
	/** Whether the popover is open */
	isOpen: boolean;
	/** Reference to the input element for positioning */
	inputRef: HTMLElement | null;
	/** Reference to the wrapper for popover positioning */
	triggerRef: HTMLElement | null;
	/** Currently selected value(s) */
	selectedValue: Set<string | number>;
	/** Whether the combobox is disabled */
	isDisabled: boolean;
	/** Whether the combobox is pending async work */
	isPending: boolean;
	/** Whether focus should currently be presented as keyboard-visible */
	isFocusVisible: boolean;
	/** Whether the combobox is read-only */
	isReadOnly: boolean;
	/** Selection mode */
	selectionMode: 'single' | 'multiple';
	/** How the popover opens: 'focus' | 'input' | 'press' */
	trigger: 'focus' | 'input' | 'press';
	/** Whether inputValue should be used for filtering (false = show all items) */
	shouldFilter: boolean;
	/** Function used to filter items locally. Null disables local filtering. */
	filter: ComboBoxFilter | null;
	/** Whether action items should be filtered with selectable items. */
	filterActionItems: boolean;
	/** Currently focused item ID (virtual focus) */
	focusedItemId: string | number | null;
	/** Registered item IDs for navigation */
	itemIds: (string | number)[];
	/** Item labels map for selection display */
	itemLabels: Map<string | number, string>;
	/** Persistent labels for selected items (not cleared on item unregister) */
	selectedLabels: Map<string | number, string>;
	/** Pending focus direction when opening with keyboard */
	pendingFocusDirection: 'first' | 'last' | null;
	/** Reference to the ListBox context for navigation delegation */
	listboxCtx: ListBoxContext | null;
	/** Reference to the ListBox DOM element for scoped queries */
	listboxRef: HTMLElement | null;
	/** Optional: Array of items for dynamic rendering */
	items?: T[];

	// Methods
	/** Set the input ref */
	setInputRef: (el: HTMLElement | null) => void;
	/** Set the trigger ref (wrapper) */
	setTriggerRef: (el: HTMLElement | null) => void;
	/** Set the ListBox context reference */
	setListboxCtx: (ctx: ListBoxContext) => void;
	/** Set the ListBox DOM element reference */
	setListboxRef: (el: HTMLElement | null) => void;
	/** Update input value */
	setInputValue: (value: string) => void;
	/** Open the popover. Pass reason 'input' when the open is caused by typing. */
	open: (options?: { reason?: 'input' | 'manual' }) => void;
	/** Close the popover. Pass refocusInput=true to keep focus on input. */
	close: (refocusInput?: boolean) => void;
	/** Toggle the popover */
	toggle: () => void;
	/** Select an item */
	select: (id: string | number, label: string) => void;
	/** Remove an item from selection (multiple mode) */
	removeItem: (id: string | number) => void;
	/** Clear all selections */
	clearSelection: () => void;
	/** Called when popover open state changes */
	onOpenChange: (open: boolean) => void;
	/** Set focused item ID (virtual focus) */
	setFocusedItemId: (id: string | number | null) => void;
	/** Register an item for navigation */
	registerItem: (id: string | number, label: string) => void;
	/** Unregister an item */
	unregisterItem: (id: string | number) => void;
	/** Register an action item that should activate instead of selecting. */
	registerItemAction: (id: string | number, registration: ComboBoxItemActionRegistration) => void;
	/** Unregister an action item. */
	unregisterItemAction: (id: string | number) => void;
	/** Activate an action item if one is registered. Returns true when handled. */
	activateItemAction: (id: string | number, source: ComboBoxItemActionSource) => boolean;
	/** Handle keyboard events (arrow navigation, enter, escape) */
	handleKeydown: (event: KeyboardEvent) => void;
	/** Handle input blur - restore selection or deselect if empty */
	handleInputBlur: (event?: FocusEvent) => void;
	/** Update root-level focus-visible state based on current modality. */
	setFocusVisible: (visible: boolean) => void;
	/** Currently focused tag ID (virtual focus for tag navigation) */
	focusedTagId: string | number | null;
	/** Set focused tag ID (virtual focus for tag navigation) */
	setFocusedTagId: (id: string | number | null) => void;
	/** Mark that the next input blur was caused by pointer interaction inside the popover. */
	markPopoverPointerDown: () => void;
	/** Consume the pending popover-pointer marker. */
	consumePopoverPointerDown: () => boolean;
	/** Whether Escape should close the popover. */
	shouldCloseOnEscape: boolean;
	/** Whether blur should close the popover. */
	shouldCloseOnBlur: boolean;
	/** Update whether Escape should close the popover. */
	setShouldCloseOnEscape: (value: boolean) => void;
	/** Update whether blur should close the popover. */
	setShouldCloseOnBlur: (value: boolean) => void;
};

const COMBOBOX_KEY = Symbol('combobox');

export function setComboBoxContext<T extends object = object>(ctx: ComboBoxContext<T>) {
	setContext(COMBOBOX_KEY, ctx);
}

export function getComboBoxContext<T extends object = object>(): ComboBoxContext<T> | undefined {
	return getContext<ComboBoxContext<T>>(COMBOBOX_KEY);
}

export function useComboBoxContext<T extends object = object>(): ComboBoxContext<T> {
	const ctx = getComboBoxContext<T>();
	if (!ctx) {
		throw new Error('ComboBox components must be used within a ComboBox');
	}
	return ctx;
}
