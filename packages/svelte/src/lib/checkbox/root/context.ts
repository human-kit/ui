import { getContext, setContext } from 'svelte';

const CHECKBOX_CONTEXT_KEY = Symbol('checkbox');

export type CheckboxState = 'checked' | 'unchecked' | 'indeterminate';

export type CheckboxContext = {
	id: string;
	inputId: string;
	inputRef: HTMLInputElement | null;
	setInputRef: (element: HTMLInputElement | null) => void;
	state: CheckboxState;
	pressed: boolean;
	isChecked: boolean;
	isIndeterminate: boolean;
	isDisabled: boolean;
	isReadOnly: boolean;
	required: boolean;
	focused: boolean;
	focusVisible: boolean;
	toggle: (event?: Event) => void;
	setState: (state: CheckboxState, event?: Event) => void;
};

export function setCheckboxContext(context: CheckboxContext) {
	setContext(CHECKBOX_CONTEXT_KEY, context);
}

export function getCheckboxContext(): CheckboxContext | undefined {
	return getContext<CheckboxContext | undefined>(CHECKBOX_CONTEXT_KEY);
}

export function useCheckboxContext(): CheckboxContext {
	const context = getCheckboxContext();
	if (!context) {
		throw new Error('Checkbox components must be used within Checkbox.Root.');
	}

	return context;
}
