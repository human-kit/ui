import { setContext, getContext } from 'svelte';

export type DialogCloseReason = 'escape-key' | 'outside-press' | 'imperative-action' | 'none';

/**
 * Context shared between Dialog components (Root, Trigger, Content).
 */
export type DialogContext = {
	/** Whether the dialog is open */
	isOpen: boolean;
	/** Reference to the trigger element */
	triggerRef: HTMLElement | null;
	/** Set the trigger ref (used by Trigger component) */
	setTriggerRef: (el: HTMLElement | null) => void;
	/** Toggle dialog open state */
	toggle: () => void;
	/** Open the dialog */
	open: () => void;
	/** Close the dialog and return focus to trigger */
	close: (reason?: DialogCloseReason, event?: Event) => void;
	/** Called when dialog open state changes */
	onOpenChange: (open: boolean) => void;
	/** ids of the `Dialog.Title` parts, for `aria-labelledby`. */
	readonly labelledBy: string | undefined;
	/** ids of the `Dialog.Description` parts, for `aria-describedby`. */
	readonly describedBy: string | undefined;
	/** Registers a label id; the returned function unregisters it. */
	registerLabel: (id: string) => () => void;
	/** Registers a description id; the returned function unregisters it. */
	registerDescription: (id: string) => () => void;
	/** Stack level for z-index calculation (set by Content) */
	stackLevel: number;
	/** Set the stack level (used by Content component) */
	setStackLevel: (level: number) => void;
};

const DIALOG_CONTEXT_KEY = Symbol('dialog');

export function setDialogContext(ctx: DialogContext) {
	setContext(DIALOG_CONTEXT_KEY, ctx);
}

export function getDialogContext(): DialogContext | undefined {
	return getContext<DialogContext>(DIALOG_CONTEXT_KEY);
}
