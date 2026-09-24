import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { RatingChangeDetails, RatingContext } from './root/context';

export type { RatingChangeDetails, RatingContext };

export type RatingRootProps = {
	/** A stable id, from which the component makes its internal ARIA ids. Give one on a server. */
	id?: string;
	/** The value, from 0 to `count`. 0 is no rating. You can bind it with `bind:value`. */
	value?: number;
	/** The value at the start, for when you give no `value`. The default is 0. */
	defaultValue?: number;
	/**
	 * Give your own code full control of the value. The component stops to write back to `value`,
	 * and it reports only through `onChange`. Thus the parent can refuse a change.
	 */
	controlledValue?: boolean;
	/** The component calls it on each change. */
	onChange?: (value: number, details: RatingChangeDetails) => void;
	/**
	 * The component calls it when a sequence of changes ends: at the release of a key, and at the
	 * press on an item. Use it for work that must not run on each key repeat.
	 */
	onChangeEnd?: (value: number, details: RatingChangeDetails) => void;
	/** The count of items. The default is 5. */
	count?: number;
	/**
	 * The distance between two values. The default is 1, which gives whole items. 0.5 gives half
	 * items. A precision below 1 makes the rating a slider, because a radio group cannot say 3.5.
	 */
	precision?: number;
	/**
	 * A press on the item of the current value puts the value back to 0. `Delete` and `Backspace`
	 * do the same. The default is on.
	 */
	allowClear?: boolean;
	/** Disables the rating. The items leave the tab order, and the value does not change. */
	disabled?: boolean;
	/** Keeps the items in the tab order, but the value does not change. */
	readonly?: boolean;
	/** Marks the rating as necessary. The root gets `aria-required`. */
	required?: boolean;
	/** Marks the value as invalid. The root gets `aria-invalid`. */
	invalid?: boolean;
	/** The name of the hidden input that carries the value in a form. */
	name?: string;
	/** The id of the form that the hidden input belongs to, when the rating is outside it. */
	form?: string;
	/**
	 * The text of one item, for the screen reader. The default is "3 of 5" in the locale. The
	 * second argument is the count.
	 */
	getItemLabel?: (value: number, count: number) => string;
	/**
	 * The text of the value, for `Rating.Output` and for the text a screen reader reads. The
	 * default is "3 of 5" in the locale, and "No rating" at 0.
	 */
	getValueText?: (value: number, count: number) => string;
	/** The accessible name of the rating, for when there is no `Rating.Label`. */
	'aria-label'?: string;
	/** The id of the element that gives the rating its name, in place of `Rating.Label`. */
	'aria-labelledby'?: string;
	/** The id of the element that describes the rating, for example an error message. */
	'aria-describedby'?: string;
	/** The content: the label, the output and the items. */
	children?: Snippet;
	/** The CSS class names of the root element. */
	class?: string;
	/** A bindable reference to the root element. */
	element?: HTMLDivElement | null;
	/** A bindable reference to the context, for a composition of your own. */
	context?: RatingContext;
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

export type RatingLabelProps = Omit<HTMLAttributes<HTMLSpanElement>, 'class'> & {
	/** The CSS class names of the label. */
	class?: string;
};

export type RatingOutputRenderState = {
	/** The value. */
	value: number;
	/** The value the user sees: the value under the pointer, or the value. */
	displayValue: number;
	/** The count of items. */
	count: number;
	/** The text of the value, in the locale. */
	text: string;
};

export type RatingOutputProps = Omit<HTMLAttributes<HTMLOutputElement>, 'class' | 'children'> & {
	/**
	 * The content. As a snippet with one argument, it receives the render state: `value`,
	 * `displayValue`, `count` and `text`. Without it, the component shows `text`.
	 */
	children?: Snippet<[RatingOutputRenderState]>;
	/** The CSS class names of the element. */
	class?: string;
};

export type RatingItemRenderState = {
	/** The value of the item: 1 for the first one. */
	value: number;
	/** The index of the item: 0 for the first one. */
	index: number;
	/** How much of the item the value fills, from 0 to 1. */
	fill: number;
	/** Whether the item is the value. */
	selected: boolean;
	/** Whether the value, or the pointer, is at this item or past it. */
	highlighted: boolean;
	/** Whether the item has the focus. */
	focused: boolean;
};

export type RatingItemProps = Omit<
	HTMLAttributes<HTMLSpanElement>,
	'class' | 'children' | 'aria-label'
> & {
	/** The index of the item. Without it, the items take the indexes in mount order. */
	index?: number;
	/** The name of this item, for the screen reader. It replaces `getItemLabel` of the root. */
	'aria-label'?: string;
	/**
	 * The content. As a snippet with one argument, it receives the render state: `value`, `index`,
	 * `fill`, `selected`, `highlighted` and `focused`.
	 */
	children?: Snippet<[RatingItemRenderState]> | Snippet;
	/** The CSS class names of the item. */
	class?: string;
	/** A bindable reference to the item element. */
	element?: HTMLSpanElement | null;
};
