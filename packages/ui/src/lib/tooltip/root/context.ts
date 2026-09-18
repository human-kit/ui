import { getContext, setContext } from 'svelte';

export type TooltipOpenReason = 'hover' | 'focus' | 'imperative-action';

export type TooltipCloseReason =
	| 'hover-out'
	| 'focus-out'
	| 'escape-key'
	| 'trigger-press'
	| 'other-tooltip'
	| 'imperative-action';

export type TooltipChangeReason = TooltipOpenReason | TooltipCloseReason;

export type TooltipOpenChangeDetails = {
	reason: TooltipChangeReason;
	event?: Event;
	cancel: () => void;
	isCanceled: boolean;
};

/**
 * Context shared between Tooltip.Root and its parts.
 */
export type TooltipContext = {
	/** The instance id. */
	instanceId: string;
	/** The id of the content element. The trigger points at it with `aria-describedby`. */
	contentId: string;
	/** Whether the tooltip is open. */
	isOpen: boolean;
	/** Whether the tooltip never opens. */
	isDisabled: boolean;
	/** The reference to the trigger element. */
	triggerRef: HTMLElement | null;
	/** The reference to the arrow element, when a `Tooltip.Arrow` is in the DOM. */
	arrowRef: HTMLElement | null;
	setTriggerRef: (element: HTMLElement | null) => void;
	setArrowRef: (element: HTMLElement | null) => void;
	open: (reason?: TooltipOpenReason, event?: Event) => void;
	close: (reason?: TooltipCloseReason, event?: Event) => void;
	/** The pointer entered the content: the tooltip stays open while the pointer is on it. */
	handleContentPointerEnter: (event: PointerEvent) => void;
	/** The pointer left the content. */
	handleContentPointerLeave: (event: PointerEvent) => void;
};

const TOOLTIP_KEY = Symbol('tooltip');

export function setTooltipContext(ctx: TooltipContext) {
	setContext(TOOLTIP_KEY, ctx);
}

export function getTooltipContext(): TooltipContext | undefined {
	return getContext<TooltipContext>(TOOLTIP_KEY);
}

export function useTooltipContext(part: string): TooltipContext {
	const ctx = getTooltipContext();
	if (!ctx) {
		throw new Error(`${part} must be used inside a Tooltip.Root`);
	}
	return ctx;
}

/** The delays that a `Tooltip.Provider` gives to the tooltips inside it. */
export type TooltipProviderContext = {
	delay: number;
	closeDelay: number;
	skipDelay: number;
};

const TOOLTIP_PROVIDER_KEY = Symbol('tooltip-provider');

export function setTooltipProviderContext(ctx: TooltipProviderContext) {
	setContext(TOOLTIP_PROVIDER_KEY, ctx);
}

export function getTooltipProviderContext(): TooltipProviderContext | undefined {
	return getContext<TooltipProviderContext>(TOOLTIP_PROVIDER_KEY);
}
