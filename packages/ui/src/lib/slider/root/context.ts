import { getContext, setContext } from 'svelte';

export type SliderOrientation = 'horizontal' | 'vertical';

/** How a value changed. */
export type SliderChangeReason = 'keyboard' | 'pointer' | 'input' | 'form-reset';

export type SliderChangeDetails = {
	reason: SliderChangeReason;
	/** The index of the thumb that moved. */
	index: number;
	event?: Event;
};

/**
 * Context shared between Slider.Root and its parts.
 */
export type SliderContext = {
	/** The instance id. Every ARIA id of the parts is made from it. */
	instanceId: string;
	/** The id of the root element. */
	rootId: string;
	/** The id of the `Slider.Label` element, when one is in the DOM. */
	labelId: string | null;
	/** The values, one per thumb, in ascending order. */
	values: number[];
	/** Whether the consumer gave an array: the shape of the value in the reports. */
	isRange: boolean;
	min: number;
	max: number;
	step: number;
	/** The step of PageUp, PageDown and Shift+Arrow. */
	largeStep: number;
	/** The steps that two thumbs keep between them. */
	minStepsBetweenThumbs: number;
	orientation: SliderOrientation;
	isDisabled: boolean;
	isReadOnly: boolean;
	isInvalid: boolean;
	/** The `name` of the native inputs, when a thumb gives none of its own. */
	name: string | undefined;
	/** The `form` of the native inputs. */
	form: string | undefined;
	/** The `aria-label` given to the root. */
	ariaLabel: string | undefined;
	/** The `aria-labelledby` given to the root. */
	ariaLabelledBy: string | undefined;
	/** The `aria-describedby` given to the root. Every thumb carries it. */
	ariaDescribedBy: string | undefined;
	/** The index of the thumb under a pointer drag, or null. */
	draggingIndex: number | null;
	/** The index of the thumb that has the focus, or null. */
	focusedIndex: number | null;
	/** The index of the thumb the user touched last. It draws above the others. */
	activeIndex: number | null;
	/** Whether the focus in the slider must show as keyboard focus. */
	isFocusVisible: boolean;
	/** Whether the root is in a right-to-left context. Read at mount and on each pointer press. */
	isRtl: boolean;
	trackRef: HTMLElement | null;
	setTrackRef: (element: HTMLElement | null) => void;
	/** Registers the id of `Slider.Label`. Returns the unregister function. */
	registerLabel: (id: string) => () => void;
	/**
	 * Registers a thumb. Without an index, the thumb takes the next free one, in mount order.
	 * Returns the index and the unregister function.
	 */
	registerThumb: (options: { index?: number; inputRef: () => HTMLInputElement | null }) => {
		index: number;
		unregister: () => void;
	};
	/** The id of the native input of a thumb. */
	getThumbInputId: (index: number) => string;
	/** The ids of every native input in the DOM, in index order. */
	thumbInputIds: string[];
	/** The position of a value in the range, from 0 to 100. */
	getPercent: (value: number) => number;
	/** The text of a value, in the locale and the `formatOptions`. */
	formatValue: (value: number) => string;
	/** The text of two values as one range in the locale, "25–45". */
	formatRange: (start: number, end: number) => string;
	/** The `aria-valuetext` of a thumb. */
	getValueText: (value: number, index: number) => string;
	/**
	 * Moves one thumb. The value is snapped, clamped, and kept between its neighbors. Returns
	 * whether the value changed.
	 */
	setValueAt: (index: number, value: number, details: SliderChangeDetails) => boolean;
	/** Moves one thumb by a step, or by the large step. Returns whether the value changed. */
	stepValueAt: (
		index: number,
		direction: -1 | 1,
		options: { large?: boolean; event?: Event }
	) => boolean;
	/** Reports the end of a sequence of changes: a key press, a drag. */
	commitValue: (details: SliderChangeDetails) => void;
	/**
	 * Starts a pointer drag. Without an index, the press picks the nearest thumb and moves it
	 * to the pointer at once. With one, the thumb stays where it is until the pointer moves.
	 */
	startDrag: (event: PointerEvent, index?: number) => void;
	/** Puts the focus on a thumb, with the modality of the interaction. */
	focusThumb: (index: number, modality: 'keyboard' | 'pointer') => void;
	setThumbFocus: (index: number, focused: boolean) => void;
	setFocusVisible: (visible: boolean) => void;
};

const SLIDER_KEY = Symbol('slider');

export function setSliderContext(ctx: SliderContext) {
	setContext(SLIDER_KEY, ctx);
}

export function getSliderContext(): SliderContext | undefined {
	return getContext<SliderContext>(SLIDER_KEY);
}

export function useSliderContext(part: string): SliderContext {
	const ctx = getSliderContext();
	if (!ctx) {
		throw new Error(`${part} must be used inside a Slider.Root`);
	}
	return ctx;
}
