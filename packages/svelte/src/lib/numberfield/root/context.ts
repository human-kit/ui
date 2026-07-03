import { getContext, setContext } from 'svelte';
import type { NumberFieldStep } from './number-utils';

const KEY = Symbol('number-field');

export type NumberFieldChangeReason =
	| 'input'
	| 'input-clear'
	| 'input-blur'
	| 'keyboard'
	| 'increment-press'
	| 'decrement-press'
	| 'wheel'
	| 'scrub';

export type NumberFieldInputState = 'synced' | 'empty' | 'partial' | 'invalid' | 'out-of-range';

export type NumberFieldContext = {
	id: string;
	inputId: string;
	value: number | null;
	inputValue: string;
	inputState: NumberFieldInputState;
	formValue: string;
	formattedValue: string;
	ariaValueNow: number | undefined;
	ariaValueText: string | undefined;
	validationMessage: string;
	min: number | undefined;
	max: number | undefined;
	step: NumberFieldStep;
	smallStep: number;
	largeStep: number;
	isDisabled: boolean;
	isReadOnly: boolean;
	isRequired: boolean;
	isInvalid: boolean;
	isOutOfRange: boolean;
	allowWheelScrub: boolean;
	allowOutOfRange: boolean;
	snapOnStep: boolean;
	incrementAriaLabel: string;
	decrementAriaLabel: string;
	focused: boolean;
	focusVisible: boolean;
	focusWithin: boolean;
	scrubbing: boolean;
	inputRef: HTMLInputElement | null;
	setInputRef: (element: HTMLInputElement | null) => void;
	setFocused: (focused: boolean) => void;
	setFocusVisible: (visible: boolean) => void;
	syncFocusWithin: () => void;
	setInputValue: (nextInputValue: string, reason: NumberFieldChangeReason, event?: Event) => void;
	commitInputValue: (reason: NumberFieldChangeReason, event?: Event) => void;
	stepBy: (
		direction: -1 | 1,
		options: { reason: NumberFieldChangeReason; event?: Event; multiplier?: number }
	) => void;
	setScrubbing: (scrubbing: boolean) => void;
};

export function setNumberFieldContext(context: NumberFieldContext) {
	setContext(KEY, context);
}

export function getNumberFieldContext(): NumberFieldContext | undefined {
	return getContext<NumberFieldContext | undefined>(KEY);
}

export function useNumberFieldContext(): NumberFieldContext {
	const context = getNumberFieldContext();
	if (!context) {
		throw new Error('NumberField components must be used within NumberField.Root.');
	}
	return context;
}

export type { NumberFieldStep };
