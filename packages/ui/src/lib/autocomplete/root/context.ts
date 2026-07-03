import { setContext, getContext } from 'svelte';
import type { ListBoxContext } from '../../listbox/root/context';

/**
 * Filter predicate used to decide whether an item is visible for a given query.
 * Return `true` to keep the item, `false` to hide it.
 */
export type AutocompleteFilter = (textValue: string, inputValue: string) => boolean;

/**
 * Default local filter: case-insensitive "contains" match.
 */
export function defaultAutocompleteFilter(textValue: string, inputValue: string): boolean {
	return textValue.toLowerCase().includes(inputValue.trim().toLowerCase());
}

/**
 * Context shared between Autocomplete and its children.
 *
 * Note: the Autocomplete does NOT own selection state. Selection lives in the
 * inner ListBox (exposed via `Autocomplete.List`). The context only manages the
 * search query, local filtering and virtual focus (aria-activedescendant).
 */
export type AutocompleteContext = {
	/** Stable instance ID used to build internal ARIA ids. */
	instanceId: string;
	/** Current search query (drives filtering). */
	inputValue: string;
	/** Whether the autocomplete is disabled. */
	isDisabled: boolean;
	/** Whether the autocomplete is read-only. */
	isReadOnly: boolean;
	/** Whether focus should currently be presented as keyboard-visible. */
	isFocusVisible: boolean;
	/** Local filter function. `null` disables local filtering (e.g. async/external). */
	filter: AutocompleteFilter | null;
	/** Currently virtually-focused item id (aria-activedescendant target). */
	focusedItemId: string | number | null;
	/** Registered (visible) item ids, used by Empty/Status. */
	itemIds: (string | number)[];
	/** Number of currently visible items after filtering. */
	visibleCount: number;
	/** Reference to the input element. */
	inputRef: HTMLElement | null;
	/** Reference to the inner ListBox context (for selecting the focused item). */
	listboxCtx: ListBoxContext | null;
	/** Reference to the inner ListBox DOM element (for scoped queries). */
	listboxRef: HTMLElement | null;

	// Methods
	/** Update the search query. */
	setInputValue: (value: string) => void;
	/** Update root-level focus-visible state. */
	setFocusVisible: (visible: boolean) => void;
	/** Set the virtually-focused item id. */
	setFocusedItemId: (id: string | number | null) => void;
	/** Register a visible item for navigation. */
	registerItem: (id: string | number, label: string) => void;
	/** Unregister an item (e.g. when filtered out or destroyed). */
	unregisterItem: (id: string | number) => void;
	/** Set the input element ref. */
	setInputRef: (el: HTMLElement | null) => void;
	/** Return DOM focus to the input. Guarantees the virtual-focus invariant. */
	focusInput: () => void;
	/** Wire the inner ListBox context. */
	setListboxCtx: (ctx: ListBoxContext) => void;
	/** Wire the inner ListBox DOM element. */
	setListboxRef: (el: HTMLElement | null) => void;
	/** Handle keyboard events originating from the input. */
	handleKeydown: (event: KeyboardEvent) => void;
};

const AUTOCOMPLETE_KEY = Symbol('autocomplete');

export function setAutocompleteContext(ctx: AutocompleteContext) {
	setContext(AUTOCOMPLETE_KEY, ctx);
}

export function getAutocompleteContext(): AutocompleteContext | undefined {
	return getContext<AutocompleteContext>(AUTOCOMPLETE_KEY);
}

export function useAutocompleteContext(): AutocompleteContext {
	const ctx = getAutocompleteContext();
	if (!ctx) {
		throw new Error('Autocomplete components must be used within an Autocomplete.Root');
	}
	return ctx;
}
