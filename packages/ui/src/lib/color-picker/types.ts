import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes, HTMLInputAttributes } from 'svelte/elements';
import type {
	Color,
	ColorChannel,
	ColorFormat,
	ColorPickerChangeDetails,
	ColorPickerContext,
	ColorPickerSliderOrientation
} from './root/context';

export type {
	Color,
	ColorChannel,
	ColorFormat,
	ColorPickerChangeDetails,
	ColorPickerContext,
	ColorPickerSliderOrientation
};

export type ColorPickerRootProps = {
	/** A stable id, from which the component makes its internal ARIA ids. Give one on a server. */
	id?: string;
	/**
	 * The color, as text: a hex color, `rgb()`, `hsl()` or `hsb()`. You can bind it with
	 * `bind:value`. The component answers in the format of `format`.
	 */
	value?: string;
	/** The color at the start, for when you give no `value`. The default is `#000000`. */
	defaultValue?: string;
	/**
	 * Give your own code full control of the color. The component stops to write back to `value`,
	 * and it reports only through `onChange`. Thus the parent can refuse a change.
	 */
	controlledValue?: boolean;
	/** The component calls it on each change, also on each move of a drag. */
	onChange?: (value: string, details: ColorPickerChangeDetails) => void;
	/**
	 * The component calls it when a sequence of changes ends: at the release of a key, and at the
	 * end of a drag. Use it for work that must not run on each move.
	 */
	onChangeEnd?: (value: string, details: ColorPickerChangeDetails) => void;
	/** The text format of the value. The default is `hex`. */
	format?: ColorFormat;
	/**
	 * Keeps an alpha in the color. The value then holds a fourth number, and `ColorPicker.Slider`
	 * accepts the `alpha` channel. The default is off.
	 */
	alpha?: boolean;
	/** Disables each control of the picker. The controls leave the tab order. */
	disabled?: boolean;
	/** Keeps the controls in the tab order, but the color does not change. */
	readonly?: boolean;
	/** Marks the color as invalid. Each control gets `aria-invalid`. */
	invalid?: boolean;
	/** The name of the hidden input that carries the color in a form. */
	name?: string;
	/** The id of the form that the hidden input belongs to, when the picker is outside it. */
	form?: string;
	/** The accessible name of the picker, for when there is no `ColorPicker.Label`. */
	'aria-label'?: string;
	/** The id of the element that gives the picker its name, in place of `ColorPicker.Label`. */
	'aria-labelledby'?: string;
	/** The id of the element that describes the picker, for example an error message. */
	'aria-describedby'?: string;
	/** The content: the label, the area, the sliders and the fields. */
	children?: Snippet;
	/** The CSS class names of the root element. */
	class?: string;
	/** A bindable reference to the root element. */
	element?: HTMLDivElement | null;
	/** A bindable reference to the context, for a composition of your own. */
	context?: ColorPickerContext;
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

export type ColorPickerLabelProps = Omit<HTMLAttributes<HTMLSpanElement>, 'class'> & {
	/** The CSS class names of the label. */
	class?: string;
};

export type ColorPickerAreaProps = Omit<HTMLAttributes<HTMLDivElement>, 'class'> & {
	/** The channel of the horizontal axis. The default is `saturation`. */
	xChannel?: ColorChannel;
	/** The channel of the vertical axis, which counts from the bottom. The default is `brightness`. */
	yChannel?: ColorChannel;
	/** The content: a `ColorPicker.AreaThumb`. */
	children?: Snippet;
	/** The CSS class names of the area. */
	class?: string;
	/** A bindable reference to the area element. */
	element?: HTMLDivElement | null;
};

export type ColorPickerAreaThumbRenderState = {
	/** The position of the thumb on the horizontal axis, from 0 to 100. */
	xPercent: number;
	/** The position of the thumb on the vertical axis, from 0 to 100, from the bottom. */
	yPercent: number;
	/** Whether a pointer moves the thumb. */
	dragging: boolean;
	/** Whether one of the two inputs of the thumb has the focus. */
	focused: boolean;
};

export type ColorPickerAreaThumbProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'class' | 'children'
> & {
	/**
	 * The content. As a snippet with one argument, it receives the render state: `xPercent`,
	 * `yPercent`, `dragging` and `focused`.
	 */
	children?: Snippet<[ColorPickerAreaThumbRenderState]> | Snippet;
	/** The CSS class names of the thumb. */
	class?: string;
	/** A bindable reference to the thumb element. */
	element?: HTMLDivElement | null;
};

export type ColorPickerSliderProps = Omit<HTMLAttributes<HTMLDivElement>, 'class'> & {
	/** The channel the slider moves, for example `hue` or `alpha`. */
	channel: ColorChannel;
	/** The direction of the track. The default is horizontal. */
	orientation?: ColorPickerSliderOrientation;
	/** The content: a `ColorPicker.SliderThumb`. */
	children?: Snippet;
	/** The CSS class names of the track. */
	class?: string;
	/** A bindable reference to the track element. */
	element?: HTMLDivElement | null;
};

export type ColorPickerSliderThumbRenderState = {
	/** The position of the thumb on the track, from 0 to 100. */
	percent: number;
	/** The value of the channel. */
	value: number;
	/** Whether a pointer moves the thumb. */
	dragging: boolean;
	/** Whether the input of the thumb has the focus. */
	focused: boolean;
};

export type ColorPickerSliderThumbProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'class' | 'children'
> & {
	/**
	 * The content. As a snippet with one argument, it receives the render state: `percent`,
	 * `value`, `dragging` and `focused`.
	 */
	children?: Snippet<[ColorPickerSliderThumbRenderState]> | Snippet;
	/** The CSS class names of the thumb. */
	class?: string;
	/** A bindable reference to the thumb element. */
	element?: HTMLDivElement | null;
};

export type ColorPickerHexFieldProps = Omit<
	HTMLInputAttributes,
	'class' | 'children' | 'value' | 'type'
> & {
	/** The CSS class names of the field. */
	class?: string;
	/** A bindable reference to the input element. */
	element?: HTMLInputElement | null;
};

export type ColorPickerChannelFieldProps = Omit<
	HTMLInputAttributes,
	'class' | 'children' | 'value' | 'type' | 'min' | 'max' | 'step'
> & {
	/** The channel the field holds, for example `red`. */
	channel: ColorChannel;
	/** The CSS class names of the field. */
	class?: string;
	/** A bindable reference to the input element. */
	element?: HTMLInputElement | null;
};

export type ColorPickerSwatchListProps = Omit<HTMLAttributes<HTMLDivElement>, 'class'> & {
	/** The content: one `ColorPicker.Swatch` for each color. */
	children?: Snippet;
	/** The CSS class names of the list. */
	class?: string;
	/** A bindable reference to the list element. */
	element?: HTMLDivElement | null;
};

export type ColorPickerSwatchProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'class' | 'children' | 'aria-label'
> & {
	/** The color of the swatch, as text. */
	color: string;
	/** The name of the swatch, for the screen reader. The default is the text of its color. */
	'aria-label'?: string;
	/** The content. Without it, the swatch is an empty element that your CSS paints. */
	children?: Snippet;
	/** The CSS class names of the swatch. */
	class?: string;
	/** A bindable reference to the swatch element. */
	element?: HTMLDivElement | null;
};

export type ColorPickerPreviewProps = Omit<HTMLAttributes<HTMLDivElement>, 'class'> & {
	/** The content. Without it, the preview is an empty element that your CSS paints. */
	children?: Snippet;
	/** The CSS class names of the preview. */
	class?: string;
	/** A bindable reference to the preview element. */
	element?: HTMLDivElement | null;
};

export type ColorPickerEyeDropperProps = Omit<HTMLButtonAttributes, 'class' | 'type'> & {
	/** The CSS class names of the button. */
	class?: string;
	/** A bindable reference to the button element. */
	element?: HTMLButtonElement | null;
};
