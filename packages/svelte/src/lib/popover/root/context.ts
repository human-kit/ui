import { setContext, getContext } from 'svelte';

/**
 * Context shared between Popover components (Root, Trigger, Content).
 */
export type PopoverContext = {
	/** Whether the popover is open */
	isOpen: boolean;
	/** Reference to the trigger element */
	triggerRef: HTMLElement | null;
	/** Set the trigger ref (used by Trigger component) */
	setTriggerRef: (el: HTMLElement | null) => void;
	/** Toggle popover open state */
	toggle: () => void;
	/** Open the popover */
	open: () => void;
	/** Close the popover and return focus to trigger */
	close: () => void;
	/** Called when popover open state changes */
	onOpenChange: (open: boolean) => void;
};

const POPOVER_CONTEXT_KEY = Symbol('popover');

export function setPopoverContext(ctx: PopoverContext) {
	setContext(POPOVER_CONTEXT_KEY, ctx);
}

export function getPopoverContext(): PopoverContext | undefined {
	return getContext<PopoverContext>(POPOVER_CONTEXT_KEY);
}

// Legacy aliases for backwards compatibility
export type PopoverTriggerContext = PopoverContext;
export const setPopoverTriggerContext = setPopoverContext;
export const getPopoverTriggerContext = getPopoverContext;
