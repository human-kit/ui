import { setContext, getContext } from 'svelte';

export type PopoverCanonicalCloseReason =
	'escape-key' | 'outside-press' | 'focus-out' | 'close-press' | 'imperative-action' | 'none';

export type PopoverCloseReason = PopoverCanonicalCloseReason;

export type PopoverOpenReason = 'trigger-press' | 'imperative-action' | 'none';

export type PopoverChangeReason = PopoverOpenReason | PopoverCloseReason;

export type PopoverOpenChangeDetails = {
	reason: PopoverChangeReason;
	event?: Event;
	cancel: () => void;
	isCanceled: boolean;
};

/**
 * Context shared between Popover components (Root, Trigger, Content).
 */
export type PopoverContext = {
	/** Reason why popover is closing */
	closeReason: PopoverCanonicalCloseReason;
	/** Whether the popover is open */
	isOpen: boolean;
	/** Reference to the trigger element */
	triggerRef: HTMLElement | null;
	/** Set the trigger ref (used by Trigger component) */
	setTriggerRef: (el: HTMLElement | null) => void;
	/** Toggle popover open state */
	toggle: (reason?: PopoverOpenReason, event?: Event) => void;
	/** Open the popover */
	open: (reason?: PopoverOpenReason, event?: Event) => void;
	/** Close the popover and return focus to trigger */
	close: (reason?: PopoverCloseReason, event?: Event) => void;
	/** Called when popover open state changes */
	onOpenChange: (open: boolean, details: PopoverOpenChangeDetails) => void;
};

const POPOVER_CONTEXT_KEY = Symbol('popover');

export function setPopoverContext(ctx: PopoverContext) {
	setContext(POPOVER_CONTEXT_KEY, ctx);
}

export function getPopoverContext(): PopoverContext | undefined {
	return getContext<PopoverContext>(POPOVER_CONTEXT_KEY);
}

export function usePopoverContext(part: string): PopoverContext {
	const ctx = getPopoverContext();
	if (!ctx) {
		throw new Error(`${part} must be used inside a Popover.Root`);
	}
	return ctx;
}
