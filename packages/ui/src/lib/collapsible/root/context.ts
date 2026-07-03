import { getContext, setContext } from 'svelte';

export type CollapsibleContext = {
	readonly isOpen: boolean;
	readonly isDisabled: boolean;
	readonly triggerId: string;
	readonly panelId: string;
	setOpen: (open: boolean) => void;
	toggle: () => void;
};

const COLLAPSIBLE_CONTEXT_KEY = Symbol('collapsible');

export function setCollapsibleContext(context: CollapsibleContext) {
	setContext(COLLAPSIBLE_CONTEXT_KEY, context);
	return context;
}

export function getCollapsibleContext() {
	return getContext<CollapsibleContext | undefined>(COLLAPSIBLE_CONTEXT_KEY);
}

export function useCollapsibleContext() {
	const context = getCollapsibleContext();
	if (!context) {
		throw new Error('Collapsible parts must be used inside `Collapsible.Root`.');
	}
	return context;
}
