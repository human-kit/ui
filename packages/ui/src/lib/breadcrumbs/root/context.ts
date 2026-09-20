import { getContext, setContext } from 'svelte';

const KEY = Symbol('breadcrumbs');

export type BreadcrumbsContext = {
	/** The count of items in the trail, on the screen or not. */
	readonly count: number;
	/** The count of items past which the middle of the trail folds. `Infinity` without a limit. */
	readonly maxItems: number;
	/** True while the middle of the trail is out of view. */
	readonly collapsed: boolean;
	/** The count of items out of view. */
	readonly hiddenCount: number;
	/** Registers an item, and answers a function that unregisters it. */
	register: (id: string) => () => void;
	/** True for an item in the folded middle of the trail. */
	isHidden: (id: string) => boolean;
	/** Unfolds the trail, and moves the focus to the first item that comes into view. */
	expand: () => void;
};

export function setBreadcrumbsContext(context: BreadcrumbsContext) {
	setContext(KEY, context);
}

export function getBreadcrumbsContext(): BreadcrumbsContext | undefined {
	return getContext<BreadcrumbsContext | undefined>(KEY);
}

export function useBreadcrumbsContext(part = 'Breadcrumbs'): BreadcrumbsContext {
	const context = getBreadcrumbsContext();
	if (!context) {
		throw new Error(`${part} must be used within Breadcrumbs.Root.`);
	}
	return context;
}
