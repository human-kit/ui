import type { Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { ExtendedPlacement } from '../primitives/floating';
import type {
	TooltipChangeReason,
	TooltipCloseReason,
	TooltipContext,
	TooltipOpenChangeDetails,
	TooltipOpenReason
} from './root/context';

export type {
	TooltipChangeReason,
	TooltipCloseReason,
	TooltipOpenChangeDetails,
	TooltipOpenReason
};

export type TooltipRootProps = {
	/** A stable id, from which the component makes the id of the content. Give one on a server. */
	id?: string;
	/** The open state. By default it goes in the two directions: use `bind:open`. */
	open?: boolean;
	/** The open state at the start, for when you give no `open`. */
	defaultOpen?: boolean;
	/**
	 * Give your own code full control of the open state. The component stops to write back to
	 * `open`, and it reports only through `onOpenChange`. Thus the parent can refuse a change: the
	 * parent does not send the new value down. The default is off, because `bind:open` is the usual
	 * case and it needs the write-back.
	 *
	 * To refuse one change, use `details.cancel()`. That function works in the two modes.
	 */
	controlledOpen?: boolean;
	/** The component calls it when the open state changes. */
	onOpenChange?: (open: boolean, details: TooltipOpenChangeDetails) => void;
	/**
	 * The milliseconds between the pointer and the open. The default is 600, or the value of the
	 * `Tooltip.Provider`. A keyboard focus opens at once.
	 */
	delay?: number;
	/**
	 * The milliseconds between the pointer leaving and the close. The pointer can cross to the
	 * content in that time, and the content then keeps the tooltip open. The default is 100, or the
	 * value of the `Tooltip.Provider`.
	 */
	closeDelay?: number;
	/** Stops the tooltip: it does not open. */
	disabled?: boolean;
	/**
	 * Opens the tooltip on a long press of a touch or a pen, because a touch has no hover. It then
	 * stays open until a press somewhere else, or Escape. The default is off: a long press has a
	 * meaning of its own on many controls.
	 */
	openOnLongPress?: boolean;
	/**
	 * The reference to the trigger element. Set it in your own code for an element that is not a
	 * `Tooltip.Trigger`, or let `Tooltip.Trigger` set it.
	 */
	triggerRef?: HTMLElement | null;
	/** The children: the Trigger and the Content. */
	children?: Snippet;
	/** A bindable reference to the context, for a composition of your own. */
	context?: TooltipContext;
};

export type TooltipProviderProps = {
	/** The milliseconds between the pointer and the open, for every tooltip inside. */
	delay?: number;
	/** The milliseconds between the pointer leaving and the close, for every tooltip inside. */
	closeDelay?: number;
	/**
	 * The milliseconds after a close in which the next tooltip opens at once. The default is 300.
	 */
	skipDelay?: number;
	children?: Snippet;
};

export type TooltipTriggerRenderState = {
	/** Whether the tooltip is open. */
	open: boolean;
};

export type TooltipTriggerProps = Omit<
	HTMLButtonAttributes,
	'type' | 'class' | 'children' | 'aria-describedby'
> & {
	/**
	 * The content. As a snippet with one argument, it receives the render state: `open`.
	 */
	children?: Snippet<[TooltipTriggerRenderState]> | Snippet;
	/** The CSS class names of the button. */
	class?: string;
	/** A bindable reference to the button element. */
	element?: HTMLButtonElement | null;
	/** The ids of other elements that describe the button. The tooltip adds its own while open. */
	'aria-describedby'?: string;
};

export type TooltipContentProps = {
	/** The distance from the trigger, on the main axis. The default is 8. */
	offset?: number;
	/** The position against the trigger. The default is `top`. */
	placement?: ExtendedPlacement;
	/** Moves the panel to the opposite side when the space is not sufficient. */
	shouldFlip?: boolean;
	/** The element that gives the limits of the position. */
	boundaryElement?: Element | null;
	/**
	 * Moves the panel with the pointer along one axis, or both, in place of a fixed position
	 * against the trigger. For a wide trigger, `x` keeps the panel above the pointer. A tooltip
	 * that a keyboard focus opened stays against the trigger.
	 */
	followPointer?: 'x' | 'y' | 'both';
	/** The content. */
	children?: Snippet;
	/** The CSS class names of the panel. */
	class?: string;
	/** A bindable reference to the panel element. */
	element?: HTMLDivElement | null;
} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children' | 'role' | 'id'>;

export type TooltipArrowProps = Omit<HTMLAttributes<HTMLSpanElement>, 'class'> & {
	/** The CSS class names of the arrow. */
	class?: string;
};
