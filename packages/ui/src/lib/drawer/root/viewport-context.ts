import { setContext, getContext } from 'svelte';

/**
 * Marks that a `Drawer.Viewport` is present.
 *
 * `Drawer.Content` positions itself against its edge when no viewport wraps it, so
 * the simple `Portal → Overlay + Content` composition works without a positioning
 * layer. Inside a viewport it stays in flow and lets the viewport's flexbox place
 * it, which is what makes cross-axis alignment and nested stacking possible.
 */
const DRAWER_VIEWPORT_KEY = Symbol('drawer-viewport');

export function markDrawerViewport() {
	setContext(DRAWER_VIEWPORT_KEY, true);
}

export function hasDrawerViewport(): boolean {
	return getContext<boolean>(DRAWER_VIEWPORT_KEY) === true;
}
