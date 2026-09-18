import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { SliderChangeDetails, SliderContext, SliderOrientation } from './root/context';

export type { SliderChangeDetails, SliderOrientation };

export type SliderValue = number | number[];

export type SliderRootProps = {
	/** A stable id, from which the component makes its internal ARIA ids. Give one on a server. */
	id?: string;
	/**
	 * The value: one number for one thumb, and an array in ascending order for a range with more
	 * thumbs. You can bind it with `bind:value`.
	 */
	value?: SliderValue;
	/** The value at the start, for when you give no `value`. The default is `min`. */
	defaultValue?: SliderValue;
	/**
	 * Give your own code full control of the value. The component stops to write back to `value`,
	 * and it reports only through `onChange`. Thus the parent can refuse a change: the parent does
	 * not send the new value down. The default is off, because `bind:value` is the usual case and
	 * it needs the write-back.
	 */
	controlledValue?: boolean;
	/** The component calls it on each change, also on each move of a drag. */
	onChange?: (value: SliderValue, details: SliderChangeDetails) => void;
	/**
	 * The component calls it when a sequence of changes ends: at the release of a key, and at the
	 * end of a drag. A change from assistive technology ends at once. Use it for work that must
	 * not run on each move.
	 */
	onChangeEnd?: (value: SliderValue, details: SliderChangeDetails) => void;
	/** The lowest value. The default is 0. */
	min?: number;
	/** The highest value. The default is 100. */
	max?: number;
	/** The distance between two values. The default is 1. */
	step?: number;
	/**
	 * The distance of `PageUp`, `PageDown` and `Shift+Arrow`. The default is one tenth of the
	 * range, and never less than one step.
	 */
	largeStep?: number;
	/** The steps that two thumbs of a range keep between them. The default is 0: they can meet. */
	minStepsBetweenThumbs?: number;
	/** The direction of the track. The default is horizontal. */
	orientation?: SliderOrientation;
	/** Disables the slider. The native inputs are disabled, and the thumbs leave the tab order. */
	disabled?: boolean;
	/** Keeps the thumbs in the tab order, but the value does not change. */
	readonly?: boolean;
	/** Marks the value as invalid. The thumbs get `aria-invalid`. */
	invalid?: boolean;
	/** The name of the native inputs. A `Slider.Thumb` can give its own. */
	name?: string;
	/** The id of the form that the native inputs belong to, when the slider is outside it. */
	form?: string;
	/** The format of the value in `Slider.Output` and in the text that a screen reader reads. */
	formatOptions?: Intl.NumberFormatOptions;
	/**
	 * The text that a screen reader reads for a value, in place of the formatted number. The
	 * second argument is the index of the thumb.
	 */
	getValueText?: (value: number, index: number) => string;
	/** The accessible name of the slider, for when there is no `Slider.Label`. */
	'aria-label'?: string;
	/** The id of the element that gives the slider its name, in place of `Slider.Label`. */
	'aria-labelledby'?: string;
	/** The id of the element that describes the slider, for example an error message. */
	'aria-describedby'?: string;
	/** The content: the label, the output and the track. */
	children?: Snippet;
	/** The CSS class names of the root element. */
	class?: string;
	/** A bindable reference to the root element. */
	element?: HTMLDivElement | null;
	/** A bindable reference to the context, for a composition of your own. */
	context?: SliderContext;
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

export type SliderLabelProps = Omit<HTMLAttributes<HTMLSpanElement>, 'class'> & {
	/** The CSS class names of the label. */
	class?: string;
};

export type SliderOutputRenderState = {
	/** The values, one per thumb. */
	values: number[];
	/** The text of each value, in the locale and the `formatOptions`. */
	texts: string[];
	/** The text of the whole value: one number, or a range in the locale. */
	text: string;
};

export type SliderOutputProps = Omit<HTMLAttributes<HTMLOutputElement>, 'class' | 'children'> & {
	/**
	 * The content. As a snippet with one argument, it receives the render state: `values`, `texts`
	 * and `text`. Without it, the component shows `text`.
	 */
	children?: Snippet<[SliderOutputRenderState]>;
	/** The CSS class names of the element. */
	class?: string;
};

export type SliderTrackProps = Omit<HTMLAttributes<HTMLDivElement>, 'class'> & {
	/** The CSS class names of the track. */
	class?: string;
	/** A bindable reference to the track element. */
	element?: HTMLDivElement | null;
};

export type SliderFillProps = Omit<HTMLAttributes<HTMLDivElement>, 'class'> & {
	/** The CSS class names of the fill. */
	class?: string;
};

export type SliderThumbRenderState = {
	/** The value of the thumb. */
	value: number;
	/** The text of the value. */
	text: string;
	/** The index of the thumb. */
	index: number;
	/** Whether the thumb is under a pointer drag. */
	dragging: boolean;
	/** Whether the native input of the thumb has the focus. */
	focused: boolean;
};

export type SliderThumbProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'class' | 'children' | 'aria-label' | 'aria-labelledby'
> & {
	/**
	 * The index of the thumb, for a range. Without it, the thumbs take the indexes in mount order.
	 */
	index?: number;
	/** The `name` of the native input of this thumb. It replaces the `name` of the root. */
	name?: string;
	/**
	 * The name of this thumb, before the name of the slider. A range of two thumbs without one
	 * gets "Minimum" and "Maximum" in the locale.
	 */
	'aria-label'?: string;
	/** The id of the element that names this thumb, in place of `aria-label`. */
	'aria-labelledby'?: string;
	/**
	 * The content. As a snippet with one argument, it receives the render state: `value`, `text`,
	 * `index`, `dragging` and `focused`.
	 */
	children?: Snippet<[SliderThumbRenderState]> | Snippet;
	/** The CSS class names of the thumb. */
	class?: string;
	/** A bindable reference to the thumb element. */
	element?: HTMLDivElement | null;
};
