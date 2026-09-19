import { getContext, setContext } from 'svelte';
import type { ToastItem } from '../provider/toast-manager.svelte';

const KEY = Symbol('toast');

export type ToastContext = {
	/** The item of this toast. */
	readonly toast: ToastItem;
	/** The ids of the registered titles, for `aria-labelledby`. */
	readonly labelledBy: string | undefined;
	/** The ids of the registered descriptions, for `aria-describedby`. */
	readonly describedBy: string | undefined;
	/** Registers a title id; the returned function unregisters it. */
	registerTitle: (id: string) => () => void;
	/** Registers a description id; the returned function unregisters it. */
	registerDescription: (id: string) => () => void;
	/** Closes this toast, and moves the focus on when it was in it. */
	close: () => void;
};

export function setToastContext(context: ToastContext) {
	setContext(KEY, context);
}

export function getToastContext(): ToastContext | undefined {
	return getContext<ToastContext | undefined>(KEY);
}

export function useToastContext(part = 'Toast'): ToastContext {
	const context = getToastContext();
	if (!context) {
		throw new Error(`${part} must be used within Toast.Root.`);
	}
	return context;
}
