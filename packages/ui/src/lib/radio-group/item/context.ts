import { getContext, setContext } from 'svelte';

const RADIO_GROUP_ITEM_CONTEXT_KEY = Symbol('radio-group-item');

export type RadioGroupItemState = 'checked' | 'unchecked';

export type RadioGroupItemContext = {
	id: string;
	inputId: string;
	value: string;
	state: RadioGroupItemState;
	pressed: boolean;
	isChecked: boolean;
	isDisabled: boolean;
	isReadOnly: boolean;
	required: boolean;
	focused: boolean;
	focusVisible: boolean;
	select: (event?: Event) => void;
};

export function setRadioGroupItemContext(context: RadioGroupItemContext) {
	setContext(RADIO_GROUP_ITEM_CONTEXT_KEY, context);
}

export function getRadioGroupItemContext(): RadioGroupItemContext | undefined {
	return getContext<RadioGroupItemContext | undefined>(RADIO_GROUP_ITEM_CONTEXT_KEY);
}

export function useRadioGroupItemContext(): RadioGroupItemContext {
	const context = getRadioGroupItemContext();
	if (!context) {
		throw new Error('Radio components must be used within RadioGroup.Item.');
	}

	return context;
}
