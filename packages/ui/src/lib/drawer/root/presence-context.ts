import { setContext, getContext } from 'svelte';

/**
 * Presence state for the drawer's enter/exit animations.
 *
 * Provided by `Drawer.Portal` — which owns how long the layers stay mounted — and
 * consumed by `Drawer.Overlay`, `Drawer.Viewport` and `Drawer.Content` for the
 * `data-state` / `data-entering` / `data-exiting` hooks that CSS animates
 * against. Content also registers its element so the Portal can measure the exit
 * animation from it, which is what makes the timing follow the consumer's own CSS
 * instead of a hard-coded duration.
 */
export type DrawerPresenceContext = {
	/** Logical state: 'open' while shown, 'closed' the moment it begins animating out. */
	readonly state: 'open' | 'closed';
	/** True for the duration of the enter animation. */
	readonly isEntering: boolean;
	/** True for the duration of the exit animation, before the node unmounts. */
	readonly isExiting: boolean;
	/** Content registers its element here so the Portal can time the exit off it. */
	setMotionTarget: (el: HTMLElement | null) => void;
};

const DRAWER_PRESENCE_KEY = Symbol('drawer-presence');

export function setDrawerPresenceContext(ctx: DrawerPresenceContext) {
	setContext(DRAWER_PRESENCE_KEY, ctx);
}

export function getDrawerPresenceContext(): DrawerPresenceContext | undefined {
	return getContext<DrawerPresenceContext>(DRAWER_PRESENCE_KEY);
}
