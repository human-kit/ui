import { setContext, getContext } from 'svelte';

/**
 * Software-keyboard inset, published by `Drawer.VirtualKeyboardProvider`.
 *
 * It travels through context rather than a CSS variable on a wrapper element
 * because the panel is portalled out of the provider's subtree, so nothing it
 * writes on itself would ever cascade down to the drawer.
 */
export type DrawerKeyboardContext = {
	/** Height the keyboard covers, in px. `0` when it is closed. */
	readonly inset: number;
};

const DRAWER_KEYBOARD_KEY = Symbol('drawer-keyboard');

export function setDrawerKeyboardContext(ctx: DrawerKeyboardContext) {
	setContext(DRAWER_KEYBOARD_KEY, ctx);
}

export function getDrawerKeyboardContext(): DrawerKeyboardContext | undefined {
	return getContext<DrawerKeyboardContext>(DRAWER_KEYBOARD_KEY);
}
