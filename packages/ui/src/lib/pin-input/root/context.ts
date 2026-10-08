import { getContext, setContext } from 'svelte';
import type { PinInputType } from './pin-input-utils';

export type { PinInputType };

/** How a value changed. */
export type PinInputChangeReason = 'input' | 'paste' | 'delete' | 'clear' | 'form-reset';

export type PinInputChangeDetails = {
	reason: PinInputChangeReason;
	event?: Event;
};

/**
 * Context shared between PinInput.Root and its parts.
 */
export type PinInputContext = {
	/** The instance id. Every ARIA id of the parts is made from it. */
	instanceId: string;
	/** The id of the root element. */
	rootId: string;
	/** The id of the `PinInput.Label` element, when one is in the DOM. */
	labelId: string | null;
	/** The value. It is never longer than `length`, and it has no holes. */
	value: string;
	/** The count of cells. */
	length: number;
	/** Which characters each cell accepts. */
	type: PinInputType;
	/** Whether the cells hide the characters. */
	mask: boolean;
	/** Whether the cells accept a code from a message. */
	otp: boolean;
	/** The text of an empty cell. */
	placeholder: string | undefined;
	isDisabled: boolean;
	isReadOnly: boolean;
	isRequired: boolean;
	isInvalid: boolean;
	/** The index of the cell that has the focus, or null. */
	focusedIndex: number | null;
	/** Whether the focus in the group must show as keyboard focus. */
	isFocusVisible: boolean;
	/** The `aria-describedby` given to the root. Each cell carries it. */
	ariaDescribedBy: string | undefined;
	/** Registers the id of `PinInput.Label`. Returns the unregister function. */
	registerLabel: (id: string) => () => void;
	/** Registers a cell. Without an index, the cell takes the next free one, in mount order. */
	registerCell: (options: { index?: number; inputRef: () => HTMLInputElement | null }) => {
		index: number;
		unregister: () => void;
	};
	/** The id of one cell. */
	getCellId: (index: number) => string;
	/** The character of one cell, or an empty text. */
	getCellCharacter: (index: number) => string;
	/** The accessible name of one cell, for example "Digit 2 of 6". */
	getCellLabel: (index: number) => string;
	/** Writes text at one cell. The focus goes to the cell after the last character it wrote. */
	insertText: (index: number, text: string, details: PinInputChangeDetails) => void;
	/** Removes the character of one cell. The characters after it move to the left. */
	deleteCharacter: (index: number, details: PinInputChangeDetails) => void;
	/** Empties the value and puts the focus on the first cell. */
	clear: (event?: Event) => void;
	/** Puts the focus on one cell. The index is clamped to the first empty cell. */
	focusCell: (index: number, modality?: 'keyboard' | 'pointer') => void;
	setCellFocus: (index: number, focused: boolean) => void;
	setFocusVisible: (visible: boolean) => void;
};

const PIN_INPUT_KEY = Symbol('pin-input');

export function setPinInputContext(ctx: PinInputContext) {
	setContext(PIN_INPUT_KEY, ctx);
}

export function getPinInputContext(): PinInputContext | undefined {
	return getContext<PinInputContext>(PIN_INPUT_KEY);
}

export function usePinInputContext(part: string): PinInputContext {
	const ctx = getPinInputContext();
	if (!ctx) {
		throw new Error(`${part} must be used inside a PinInput.Root`);
	}
	return ctx;
}
