import { setContext, getContext } from 'svelte';

/**
 * Presence state for the dialog's enter/exit animations.
 *
 * Provided by Dialog.Portal — which owns how long the Overlay + Content stay mounted — and consumed
 * by Dialog.Overlay and Dialog.Content to expose the `data-state` / `data-entering` / `data-exiting`
 * hooks that CSS animates against. Content also registers its element so the Portal can measure the
 * exit animation from it.
 */
export type DialogPresenceContext = {
	/** Logical state: 'open' while shown, 'closed' the moment it begins animating out. */
	readonly state: 'open' | 'closed';
	/** True for the duration of the enter animation. */
	readonly isEntering: boolean;
	/** True for the duration of the exit animation, before the node unmounts. */
	readonly isExiting: boolean;
	/** Content registers its element here so the Portal can time the exit animation off it. */
	setMotionTarget: (el: HTMLElement | null) => void;
};

const DIALOG_PRESENCE_KEY = Symbol('dialog-presence');

export function setDialogPresenceContext(ctx: DialogPresenceContext) {
	setContext(DIALOG_PRESENCE_KEY, ctx);
}

export function getDialogPresenceContext(): DialogPresenceContext | undefined {
	return getContext<DialogPresenceContext>(DIALOG_PRESENCE_KEY);
}
