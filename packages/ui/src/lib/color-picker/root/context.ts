import { getContext, setContext } from 'svelte';
import type { Color, ColorChannel, ColorChannelRange, ColorFormat } from './color';

export type { Color, ColorChannel, ColorChannelRange, ColorFormat };

/** How a color changed. */
export type ColorPickerChangeReason =
	'pointer' | 'keyboard' | 'input' | 'swatch' | 'eye-dropper' | 'form-reset';

export type ColorPickerChangeDetails = {
	reason: ColorPickerChangeReason;
	/** The channel that moved, when one channel moved. */
	channel?: ColorChannel;
	event?: Event;
};

/**
 * Context shared between ColorPicker.Root and its parts.
 */
export type ColorPickerContext = {
	/** The instance id. Every ARIA id of the parts is made from it. */
	instanceId: string;
	/** The id of the root element. */
	rootId: string;
	/** The id of the `ColorPicker.Label` element, when one is in the DOM. */
	labelId: string | null;
	/** The color: hue, saturation, brightness and alpha. */
	color: Color;
	/** The text of the color, in the format of the root. */
	text: string;
	/** The color as CSS, always with its alpha. */
	cssColor: string;
	/** The color of the hue, at full saturation and brightness. */
	hueColor: string;
	/** The text format of the value. */
	format: ColorFormat;
	/** Whether the picker holds an alpha. */
	hasAlpha: boolean;
	isDisabled: boolean;
	isReadOnly: boolean;
	isInvalid: boolean;
	/** The `aria-label` given to the root. */
	ariaLabel: string | undefined;
	/** The `aria-labelledby` given to the root. */
	ariaLabelledBy: string | undefined;
	/** The `aria-describedby` given to the root. Each control carries it. */
	ariaDescribedBy: string | undefined;
	/** Registers the id of `ColorPicker.Label`. Returns the unregister function. */
	registerLabel: (id: string) => () => void;
	/** The id of one control of the picker, for example `area-thumb` or `channel-red`. */
	getPartId: (part: string) => string;
	/** The limits and the steps of one channel. */
	getChannelRange: (channel: ColorChannel) => ColorChannelRange;
	/** The value of one channel, rounded as a field shows it. */
	getChannelValue: (channel: ColorChannel) => number;
	/** The position of one channel between its limits, from 0 to 100. */
	getChannelPercent: (channel: ColorChannel) => number;
	/** The name of one channel in the locale, for example "Saturation". */
	getChannelLabel: (channel: ColorChannel) => string;
	/** The text a screen reader reads for one channel, for example "50%". */
	getChannelValueText: (channel: ColorChannel) => string;
	/** The color with one channel at another value, as CSS. It paints the track of a slider. */
	getChannelColor: (channel: ColorChannel, value: number) => string;
	/** Writes one channel. Returns whether the color changed. */
	setChannel: (channel: ColorChannel, value: number, details: ColorPickerChangeDetails) => boolean;
	/** Moves one channel by a step, or by the large step. */
	stepChannel: (
		channel: ColorChannel,
		direction: -1 | 1,
		options: { large?: boolean; event?: Event }
	) => boolean;
	/** Writes the whole color. Returns whether the color changed. */
	setColor: (color: Color, details: ColorPickerChangeDetails) => boolean;
	/** Reads a text into the color. Returns whether the text named a color. */
	setText: (text: string, details: ColorPickerChangeDetails) => boolean;
	/** Reports the end of a sequence of changes: a key press, a drag. */
	commit: (details: ColorPickerChangeDetails) => void;
};

const COLOR_PICKER_KEY = Symbol('color-picker');

export function setColorPickerContext(ctx: ColorPickerContext) {
	setContext(COLOR_PICKER_KEY, ctx);
}

export function getColorPickerContext(): ColorPickerContext | undefined {
	return getContext<ColorPickerContext>(COLOR_PICKER_KEY);
}

export function useColorPickerContext(part: string): ColorPickerContext {
	const ctx = getColorPickerContext();
	if (!ctx) {
		throw new Error(`${part} must be used inside a ColorPicker.Root`);
	}
	return ctx;
}

/** Context of one `ColorPicker.Area`, for its thumb. */
export type ColorPickerAreaContext = {
	xChannel: ColorChannel;
	yChannel: ColorChannel;
	/** The position of the thumb, from 0 to 100. The y axis counts from the bottom. */
	xPercent: number;
	yPercent: number;
	/** Whether a pointer moves the thumb. */
	isDragging: boolean;
	/** Whether the area is in a right-to-left context. */
	isRtl: boolean;
	areaId: string;
	/** Starts a pointer drag from the thumb. The color does not change until the pointer moves. */
	startDrag: (event: PointerEvent) => void;
};

const COLOR_PICKER_AREA_KEY = Symbol('color-picker-area');

export function setColorPickerAreaContext(ctx: ColorPickerAreaContext) {
	setContext(COLOR_PICKER_AREA_KEY, ctx);
}

export function useColorPickerAreaContext(part: string): ColorPickerAreaContext {
	const ctx = getContext<ColorPickerAreaContext>(COLOR_PICKER_AREA_KEY);
	if (!ctx) {
		throw new Error(`${part} must be used inside a ColorPicker.Area`);
	}
	return ctx;
}

export type ColorPickerSliderOrientation = 'horizontal' | 'vertical';

/** Context of one `ColorPicker.Slider`, for its thumb. */
export type ColorPickerSliderContext = {
	channel: ColorChannel;
	orientation: ColorPickerSliderOrientation;
	/** The position of the thumb on the track, from 0 to 100. */
	percent: number;
	isDragging: boolean;
	isRtl: boolean;
	sliderId: string;
	startDrag: (event: PointerEvent) => void;
};

const COLOR_PICKER_SLIDER_KEY = Symbol('color-picker-slider');

export function setColorPickerSliderContext(ctx: ColorPickerSliderContext) {
	setContext(COLOR_PICKER_SLIDER_KEY, ctx);
}

export function useColorPickerSliderContext(part: string): ColorPickerSliderContext {
	const ctx = getContext<ColorPickerSliderContext>(COLOR_PICKER_SLIDER_KEY);
	if (!ctx) {
		throw new Error(`${part} must be used inside a ColorPicker.Slider`);
	}
	return ctx;
}

/** Context of one `ColorPicker.SwatchList`, for its swatches. */
export type ColorPickerSwatchListContext = {
	listId: string;
	/** Registers a swatch. Returns its index and the unregister function. */
	register: (options: { elementRef: () => HTMLElement | null; color: () => string }) => {
		index: number;
		unregister: () => void;
	};
	/** Whether one swatch is the one the tab order lands on. */
	isTabStop: (index: number) => boolean;
	/** Moves the focus between the swatches. */
	moveFocus: (from: number, step: number | 'first' | 'last') => void;
	/** Answers a press or a key on one swatch. */
	select: (color: string, event?: Event) => void;
	/** Whether the color of a swatch is the color of the picker. */
	isSelected: (color: string) => boolean;
};

const COLOR_PICKER_SWATCH_LIST_KEY = Symbol('color-picker-swatch-list');

export function setColorPickerSwatchListContext(ctx: ColorPickerSwatchListContext) {
	setContext(COLOR_PICKER_SWATCH_LIST_KEY, ctx);
}

export function getColorPickerSwatchListContext(): ColorPickerSwatchListContext | undefined {
	return getContext<ColorPickerSwatchListContext>(COLOR_PICKER_SWATCH_LIST_KEY);
}
