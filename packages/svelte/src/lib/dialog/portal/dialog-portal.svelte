<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Portal } from '../../portal';
	import { trackMotionEnd, type MotionTracker } from '../../primitives/motion';
	import { getDialogContext } from '../root/context';
	import { setDialogPresenceContext } from '../root/presence-context';

	/**
	 * Dialog.Portal - Renders Overlay + Content into a portal while the dialog is open, and keeps
	 * them mounted through the exit animation so it can play before they leave the DOM.
	 * Must be used inside a Dialog.Root.
	 */
	type DialogPortalProps = {
		/** Content to render in portal (Overlay and Content) */
		children?: Snippet;
	};

	let { children }: DialogPortalProps = $props();

	const ctx = getDialogContext();

	if (!ctx) {
		throw new Error('Dialog.Portal must be used inside a Dialog.Root');
	}

	const dialogCtx = ctx;

	// Presence: `isMounted` outlives `isOpen` by one exit animation. The exit duration is measured
	// from the Content element (registered via setMotionTarget), so timing follows the consumer's
	// CSS and collapses to a single frame under prefers-reduced-motion.
	let isMounted = $state(dialogCtx.isOpen);
	let isEntering = $state(false);
	let isExiting = $state(false);
	let motionTarget = $state<HTMLElement | null>(null);
	let tracker: MotionTracker | undefined;

	function clearTracker() {
		tracker?.cancel();
		tracker = undefined;
	}

	// Mount on open; flip to the exit phase on close (keeping the node mounted for now).
	$effect(() => {
		if (dialogCtx.isOpen) {
			const shouldAnimateIn = !isMounted || isExiting;
			isMounted = true;
			isExiting = false;
			if (shouldAnimateIn) {
				isEntering = true;
			}
			return;
		}

		if (!isMounted) {
			isEntering = false;
			isExiting = false;
			return;
		}

		isEntering = false;
		isExiting = true;
	});

	// End the active phase once the Content element's motion finishes — unmounting after exit.
	$effect(() => {
		if (!isMounted || !motionTarget) {
			clearTracker();
			return;
		}

		if (isEntering) {
			clearTracker();
			tracker = trackMotionEnd(motionTarget, () => {
				isEntering = false;
			});
			return;
		}

		if (isExiting) {
			clearTracker();
			tracker = trackMotionEnd(motionTarget, () => {
				isExiting = false;
				isMounted = false;
			});
			return;
		}

		clearTracker();
	});

	$effect(() => () => clearTracker());

	setDialogPresenceContext({
		get state() {
			return dialogCtx.isOpen ? 'open' : 'closed';
		},
		get isEntering() {
			return isEntering;
		},
		get isExiting() {
			return isExiting;
		},
		setMotionTarget: (el) => {
			motionTarget = el;
		}
	});
</script>

{#if isMounted}
	<Portal>
		{#if children}
			{@render children()}
		{/if}
	</Portal>
{/if}
