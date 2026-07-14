/**
 * Presence machine for enter/exit animations.
 *
 * Overlay-style components (popover/menu/dialog panels and backdrops) keep their node mounted
 * across the exit animation: `isMounted` outlives the `open` signal by one exit, and the
 * enter/exit phases end when the tracked element's CSS motion actually finishes (via
 * `trackMotionEnd`), collapsing to a single frame under prefers-reduced-motion.
 *
 * Must be called during component initialization — it wires its own `$effect`s, so the machine
 * starts on mount and tears down (canceling any in-flight motion tracker) on destroy.
 */

import { trackMotionEnd, type MotionTracker } from './motion';

export type PresenceOptions = {
	/**
	 * Initial `isMounted` value. Defaults to `false` (the node mounts — and animates in — on the
	 * first effect run). Pass the current open state to render immediately on first paint without
	 * an enter phase (e.g. a dialog portal created while already open).
	 */
	initiallyMounted?: boolean;
	/**
	 * Runs at the start of every evaluation of the open branch, before `isMounted`/`isEntering`
	 * flip — so `presence.isMounted` still reads the previous value inside the hook. Fires on each
	 * re-evaluation while open; callers needing once-per-open-cycle semantics keep their own guard
	 * (e.g. a pushed layer id, or `!presence.isMounted`).
	 */
	onOpen?: () => void;
	/**
	 * Runs at the start of every evaluation of the closed branch, before the exit state updates.
	 * Used for teardown that must happen as soon as the close begins (e.g. popping a layer off the
	 * stack while the exit animation still plays). Must be idempotent.
	 */
	onClose?: () => void;
};

export type Presence = {
	/** Whether the node should be in the DOM (true through the whole exit animation). */
	readonly isMounted: boolean;
	/** Whether the enter animation is currently playing. */
	readonly isEntering: boolean;
	/** Whether the exit animation is currently playing. */
	readonly isExiting: boolean;
};

/**
 * Creates a presence machine driven by `getOpen`, timing enter/exit phases from `getElement`'s
 * computed CSS motion. Both getters are read inside effects, so they must read reactive state.
 *
 * If the exit phase starts while `getElement()` is null (nothing to measure — e.g. a portal whose
 * motion target never registered), the exit resolves immediately instead of staying mounted
 * forever.
 */
export function createPresence(
	getOpen: () => boolean,
	getElement: () => HTMLElement | null | undefined,
	options: PresenceOptions = {}
): Presence {
	let isMounted = $state(options.initiallyMounted ?? false);
	let isEntering = $state(false);
	let isExiting = $state(false);
	let tracker: MotionTracker | undefined;

	function clearTracker() {
		tracker?.cancel();
		tracker = undefined;
	}

	// Mount on open; flip to the exit phase on close while staying mounted for the animation.
	$effect(() => {
		if (getOpen()) {
			options.onOpen?.();
			const shouldAnimateIn = !isMounted || isExiting;
			isMounted = true;
			isExiting = false;
			if (shouldAnimateIn) {
				isEntering = true;
			}
			return;
		}

		options.onClose?.();

		if (!isMounted) {
			isEntering = false;
			isExiting = false;
			return;
		}

		isEntering = false;
		isExiting = true;
	});

	// End the active phase once the element's motion finishes — unmounting after exit.
	$effect(() => {
		const element = getElement();
		if (!isMounted || !element) {
			clearTracker();
			// Without an element there is no motion to measure — resolve the exit
			// immediately so the node doesn't stay mounted forever.
			if (isExiting && !element) {
				isExiting = false;
				isMounted = false;
			}
			return;
		}

		if (isEntering) {
			clearTracker();
			tracker = trackMotionEnd(element, () => {
				isEntering = false;
			});
			return;
		}

		if (isExiting) {
			clearTracker();
			tracker = trackMotionEnd(element, () => {
				isExiting = false;
				isMounted = false;
			});
			return;
		}

		clearTracker();
	});

	// Cancel any in-flight tracker when the owning component is destroyed.
	$effect(() => () => clearTracker());

	return {
		get isMounted() {
			return isMounted;
		},
		get isEntering() {
			return isEntering;
		},
		get isExiting() {
			return isExiting;
		}
	};
}
