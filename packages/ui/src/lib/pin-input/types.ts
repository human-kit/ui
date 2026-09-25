import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLInputAttributes } from 'svelte/elements';
import type { PinInputChangeDetails, PinInputContext, PinInputType } from './root/context';

export type { PinInputChangeDetails, PinInputContext, PinInputType };

export type PinInputRootProps = {
	/** A stable id, from which the component makes its internal ARIA ids. Give one on a server. */
	id?: string;
	/**
	 * The value. It is never longer than `length`, and it has no holes: the characters fill the
	 * cells from the first one. You can bind it with `bind:value`.
	 */
	value?: string;
	/** The value at the start, for when you give no `value`. */
	defaultValue?: string;
	/**
	 * Give your own code full control of the value. The component stops to write back to `value`,
	 * and it reports only through `onChange`. Thus the parent can refuse a change.
	 */
	controlledValue?: boolean;
	/** The component calls it on each change. */
	onChange?: (value: string, details: PinInputChangeDetails) => void;
	/** The component calls it one time, when the last cell takes a character. */
	onComplete?: (value: string) => void;
	/** The count of cells. The default is 6. */
	length?: number;
	/**
	 * Which characters the cells accept: only the digits, the letters, or both. The default is
	 * `numeric`, which also sets the numeric keyboard on a telephone.
	 */
	type?: PinInputType;
	/** A test of your own for one character. It replaces the test of `type`. */
	pattern?: RegExp;
	/**
	 * Marks the cells as a code from a message. The telephone then offers the code of the last
	 * message above the keyboard, and one touch fills each cell.
	 */
	otp?: boolean;
	/** Hides the characters, as a password field does. */
	mask?: boolean;
	/** The text of an empty cell. */
	placeholder?: string;
	/** Moves the focus off the last cell when the value is complete. */
	blurOnComplete?: boolean;
	/** Disables each cell. The cells leave the tab order. */
	disabled?: boolean;
	/** Keeps the cells in the tab order, but the value does not change. */
	readonly?: boolean;
	/** Marks the value as necessary. Each cell gets `required`. */
	required?: boolean;
	/** Marks the value as invalid. Each cell gets `aria-invalid`. */
	invalid?: boolean;
	/** The name of the hidden input that carries the whole value in a form. */
	name?: string;
	/** The id of the form that the hidden input belongs to, when the group is outside it. */
	form?: string;
	/** The accessible name of the group, for when there is no `PinInput.Label`. */
	'aria-label'?: string;
	/** The id of the element that gives the group its name, in place of `PinInput.Label`. */
	'aria-labelledby'?: string;
	/** The id of the element that describes the group, for example an error message. */
	'aria-describedby'?: string;
	/** The content: the label and the cells. */
	children?: Snippet;
	/** The CSS class names of the root element. */
	class?: string;
	/** A bindable reference to the root element. */
	element?: HTMLDivElement | null;
	/** A bindable reference to the context, for a composition of your own. */
	context?: PinInputContext;
} & Omit<
	HTMLAttributes<HTMLDivElement>,
	| 'class'
	| 'children'
	| 'id'
	| 'role'
	| 'aria-label'
	| 'aria-labelledby'
	| 'aria-describedby'
	| 'onchange'
>;

export type PinInputLabelProps = Omit<HTMLAttributes<HTMLSpanElement>, 'class'> & {
	/** The CSS class names of the label. */
	class?: string;
};

export type PinInputCellProps = Omit<
	HTMLInputAttributes,
	'class' | 'children' | 'value' | 'type' | 'aria-label' | 'maxlength' | 'size'
> & {
	/** The index of the cell. Without it, the cells take the indexes in mount order. */
	index?: number;
	/** The name of this cell, for the screen reader. The default is "Digit 2 of 6". */
	'aria-label'?: string;
	/** The CSS class names of the cell. */
	class?: string;
	/** A bindable reference to the input element. */
	element?: HTMLInputElement | null;
};
