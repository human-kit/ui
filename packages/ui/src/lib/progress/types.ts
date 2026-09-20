import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { ProgressContext, ProgressOrientation, ProgressStatus } from './root/context.js';

export type { ProgressContext, ProgressOrientation, ProgressStatus } from './root/context.js';

export type ProgressRootProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'id' | 'role' | 'aria-valuenow' | 'aria-valuemin' | 'aria-valuemax'
> & {
	/**
	 * The progress of the task, between `min` and `max`. `null` makes the progress indeterminate:
	 * the task runs, and its end is not known. A value out of the range is held at the near end.
	 */
	value: number | null;
	/** The value at the start of the task. */
	min?: number;
	/** The value at the end of the task. The progress is complete when the value reaches it. */
	max?: number;
	/**
	 * The format of the value as text. Without it, the text is the position in the range as a
	 * percentage. Give the options of `Intl.NumberFormat` to show the value itself, in a unit.
	 */
	format?: Intl.NumberFormatOptions;
	/**
	 * Makes the text a screen reader gets for the value. It gets the formatted text and the value.
	 * Without it, the screen reader gets the formatted text.
	 */
	getValueText?: (formattedValue: string, value: number | null) => string;
	/**
	 * The text a screen reader gets for the value. It wins over `getValueText`. It has no effect
	 * while the progress is indeterminate: without a number, a text for the number is nothing.
	 */
	'aria-valuetext'?: string;
	/**
	 * The direction of the bar. It sets `data-orientation` for your styles, and it tells the
	 * indicator which side to fill from.
	 */
	orientation?: ProgressOrientation;
	/** The parts of the progress bar. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The id of the root element. The component makes one when you give none. */
	id?: string;
	/** The root element. Use `bind:element` to read it. */
	element?: HTMLDivElement | null;
	/**
	 * The state of the progress. Use `bind:context` to read `percent`, `status` and
	 * `formattedValue` for a shape of your own, such as a ring.
	 */
	context?: ProgressContext;
};

export type ProgressLabelProps = Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children' | 'class' | 'id'
> & {
	/** The name of the task. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
	/** The id of the label element. The component makes one when you give none. */
	id?: string;
};

export type ProgressTrackProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/** The indicator. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
};

export type ProgressIndicatorProps = Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'class'> & {
	/** Content inside the indicator, such as a stripe. */
	children?: Snippet;
	/** The CSS class names of the element. */
	class?: string;
};

export type ProgressValueState = {
	/** The value as text. Empty while the progress is indeterminate. */
	formattedValue: string;
	/** The value, held in the range. `null` while the progress is indeterminate. */
	value: number | null;
	status: ProgressStatus;
};

export type ProgressValueProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children' | 'class'> & {
	/** The content in place of the formatted text. It gets the text, the value and the status. */
	children?: Snippet<[ProgressValueState]>;
	/** The CSS class names of the element. */
	class?: string;
};
