import { getContext, setContext } from 'svelte';

/** How a value changed. */
export type RatingChangeReason = 'keyboard' | 'pointer' | 'clear' | 'form-reset';

export type RatingChangeDetails = {
	reason: RatingChangeReason;
	event?: Event;
};

/**
 * Context shared between Rating.Root and its parts.
 */
export type RatingContext = {
	/** The instance id. Every ARIA id of the parts is made from it. */
	instanceId: string;
	/** The id of the root element. */
	rootId: string;
	/** The id of the `Rating.Label` element, when one is in the DOM. */
	labelId: string | null;
	/** The value, from 0 to `count`. */
	value: number;
	/** The value the user sees: the value under the pointer, or the value. */
	displayValue: number;
	/** The count of items. */
	count: number;
	/** The distance between two values. 1 gives whole stars, and 0.5 gives half stars. */
	precision: number;
	/** Whether a press on the selected item puts the value back to 0. */
	allowClear: boolean;
	isDisabled: boolean;
	isReadOnly: boolean;
	isRequired: boolean;
	isInvalid: boolean;
	/** Whether the pointer is on the items. */
	isHovering: boolean;
	/** Whether the focus in the rating must show as keyboard focus. */
	isFocusVisible: boolean;
	/** Whether the root is in a right-to-left context. */
	isRtl: boolean;
	/**
	 * Whether each item is a radio. A precision of 1 makes a radio group, because each value is
	 * one item. A smaller precision makes a slider: a radio group cannot say 3.5.
	 */
	isRadioGroup: boolean;
	/** The `aria-label` given to the root. */
	ariaLabel: string | undefined;
	/** The `aria-labelledby` given to the root. */
	ariaLabelledBy: string | undefined;
	/** The `aria-describedby` given to the root. */
	ariaDescribedBy: string | undefined;
	/** The index of the item that has the focus, or null. */
	focusedIndex: number | null;
	/** Registers the id of `Rating.Label`. Returns the unregister function. */
	registerLabel: (id: string) => () => void;
	/** Registers an item. Without an index, the item takes the next free one, in mount order. */
	registerItem: (options: { index?: number; elementRef: () => HTMLElement | null }) => {
		index: number;
		unregister: () => void;
	};
	/** The id of one item element. */
	getItemId: (index: number) => string;
	/** How much of one item the value fills, from 0 to 1. */
	getItemFill: (itemValue: number) => number;
	/** The text of one item, for example "3 Stars". */
	getItemLabel: (itemValue: number) => string;
	/** The text of the value, for `Rating.Output` and for `aria-valuetext`. */
	getValueText: (value: number) => string;
	/** The `tabindex` of one item. Null keeps the item out of the tab order. */
	getItemTabIndex: (itemValue: number) => number | null;
	/** Writes a value. The value is snapped and clamped. Returns whether the value changed. */
	setValue: (value: number, details: RatingChangeDetails) => boolean;
	/** Moves the value by one step, or to a value the keyboard names. */
	stepValue: (direction: -1 | 1, event?: Event) => boolean;
	/** Reports the end of a sequence of changes: a key press, a press on an item. */
	commitValue: (details: RatingChangeDetails) => void;
	/** Answers a press on an item, with the position of the pointer inside it. */
	pressItem: (itemValue: number, event: PointerEvent) => void;
	/** Holds the value the pointer is on, for the preview. Null ends the preview. */
	setHoverValue: (value: number | null) => void;
	/** Puts the focus on the item of a value. */
	focusValue: (value: number) => void;
	setItemFocus: (index: number, focused: boolean) => void;
	setFocusVisible: (visible: boolean) => void;
};

const RATING_KEY = Symbol('rating');

export function setRatingContext(ctx: RatingContext) {
	setContext(RATING_KEY, ctx);
}

export function getRatingContext(): RatingContext | undefined {
	return getContext<RatingContext>(RATING_KEY);
}

export function useRatingContext(part: string): RatingContext {
	const ctx = getRatingContext();
	if (!ctx) {
		throw new Error(`${part} must be used inside a Rating.Root`);
	}
	return ctx;
}
