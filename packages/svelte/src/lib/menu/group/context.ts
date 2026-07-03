import { setContext, getContext } from 'svelte';

/**
 * Context shared between Menu.Group and Menu.GroupLabel so the group can
 * reference its label via `aria-labelledby`.
 */
export type MenuGroupContext = {
	/** The current label element id, or undefined if no label is rendered. */
	labelId: string | undefined;
	/** Sets (or clears) the label element id. */
	setLabelId: (id: string | undefined) => void;
};

const MENU_GROUP_CONTEXT_KEY = Symbol('menu-group');

export function setMenuGroupContext(ctx: MenuGroupContext) {
	setContext(MENU_GROUP_CONTEXT_KEY, ctx);
}

export function getMenuGroupContext(): MenuGroupContext | undefined {
	return getContext<MenuGroupContext>(MENU_GROUP_CONTEXT_KEY);
}
