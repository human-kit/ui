import { getContext, setContext } from 'svelte';
import type { InternalToastManager, ToastManager } from './toast-manager.svelte';

const PROVIDER_KEY = Symbol('toast-provider');

export type ToastProviderContext = {
	manager: InternalToastManager;
	/** The pointer rests on the viewport. */
	readonly hovering: boolean;
	/** The focus is in the viewport. */
	readonly focused: boolean;
	/** A touch tapped a toast, and no touch outside the viewport came after it. */
	readonly tapped: boolean;
	/**
	 * The toasts are spread out: the pointer rests on them, the focus is in them, or a touch
	 * tapped them.
	 */
	readonly expanded: boolean;
	/** The viewport element. */
	readonly viewportElement: HTMLElement | null;
	/** The height of each toast on the screen, by id, for a stack. */
	readonly heights: ReadonlyMap<string, number>;
	setHovering: (hovering: boolean) => void;
	setFocused: (focused: boolean) => void;
	setTapped: (tapped: boolean) => void;
	setViewportElement: (element: HTMLElement | null) => void;
	setHeight: (id: string, height: number | null) => void;
	/** Moves the focus to the next toast, or back to where it was before the viewport. */
	focusAfterClose: (id: string) => void;
	/** The viewport gives the function behind `focusAfterClose`. */
	setFocusAfterClose: (handler: ((id: string) => void) | null) => void;
};

export function setToastProviderContext(context: ToastProviderContext) {
	setContext(PROVIDER_KEY, context);
}

export function getToastProviderContext(): ToastProviderContext | undefined {
	return getContext<ToastProviderContext | undefined>(PROVIDER_KEY);
}

export function useToastProviderContext(part = 'Toast'): ToastProviderContext {
	const context = getToastProviderContext();
	if (!context) {
		throw new Error(`${part} must be used within Toast.Provider.`);
	}
	return context;
}

/**
 * The manager of the nearest `Toast.Provider`: `add`, `update`, `close` and `promise`. Call it
 * in a component under the provider, at the start of its script.
 */
export function useToastManager<Data = unknown>(): ToastManager<Data> {
	return useToastProviderContext('useToastManager').manager as ToastManager<Data>;
}
