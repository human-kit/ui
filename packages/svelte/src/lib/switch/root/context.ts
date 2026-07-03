import { getContext, setContext } from 'svelte';

const SWITCH_CONTEXT_KEY = Symbol('switch');

export type SwitchContext = {
	id: string;
	inputId: string;
	inputRef: HTMLInputElement | null;
	setInputRef: (element: HTMLInputElement | null) => void;
	isChecked: boolean;
	isDisabled: boolean;
	isReadOnly: boolean;
	required: boolean;
	pressed: boolean;
	focused: boolean;
	focusVisible: boolean;
	toggle: (event?: Event) => void;
	setChecked: (checked: boolean, event?: Event) => void;
};

export function setSwitchContext(context: SwitchContext) {
	setContext(SWITCH_CONTEXT_KEY, context);
}

export function getSwitchContext(): SwitchContext | undefined {
	return getContext<SwitchContext | undefined>(SWITCH_CONTEXT_KEY);
}

export function useSwitchContext(): SwitchContext {
	const context = getSwitchContext();
	if (!context) {
		throw new Error('Switch components must be used within Switch.Root.');
	}

	return context;
}
