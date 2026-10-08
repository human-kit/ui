import { getContext, setContext } from 'svelte';

const KEY = Symbol('search-field');

/** What made the value change. */
export type SearchFieldChangeReason = 'input' | 'escape-key' | 'clear-press' | 'form-reset';

export type SearchFieldContext = {
	id: string;
	inputId: string;
	value: string;
	defaultValue: string;
	name: string | undefined;
	isEmpty: boolean;
	isDisabled: boolean;
	isReadOnly: boolean;
	isRequired: boolean;
	isInvalid: boolean;
	clearAriaLabel: string;
	focused: boolean;
	focusVisible: boolean;
	inputRef: HTMLInputElement | null;
	setInputRef: (element: HTMLInputElement | null) => void;
	setFocused: (focused: boolean) => void;
	setFocusVisible: (visible: boolean) => void;
	setValue: (value: string, reason: SearchFieldChangeReason) => void;
	/** Empties the value and calls `onClear`. It does nothing when the value is already empty. */
	clear: (reason: 'escape-key' | 'clear-press') => boolean;
	submit: () => void;
};

export function setSearchFieldContext(context: SearchFieldContext) {
	setContext(KEY, context);
}

export function getSearchFieldContext(): SearchFieldContext | undefined {
	return getContext<SearchFieldContext | undefined>(KEY);
}

export function useSearchFieldContext(part: string): SearchFieldContext {
	const context = getSearchFieldContext();
	if (!context) {
		throw new Error(`${part} must be used within SearchField.Root.`);
	}
	return context;
}
