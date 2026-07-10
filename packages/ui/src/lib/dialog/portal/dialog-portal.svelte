<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Portal } from '../../portal';
	import { createPresence } from '../../primitives/presence.svelte';
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
	// CSS and collapses to a single frame under prefers-reduced-motion. When no Content ever
	// registers (e.g. the Portal only wraps a Dialog.Overlay) the exit resolves immediately so
	// the portal doesn't stay mounted forever. Starts mounted when created while already open.
	let motionTarget = $state<HTMLElement | null>(null);

	const presence = createPresence(
		() => dialogCtx.isOpen,
		() => motionTarget,
		{ initiallyMounted: dialogCtx.isOpen }
	);

	setDialogPresenceContext({
		get state() {
			return dialogCtx.isOpen ? 'open' : 'closed';
		},
		get isEntering() {
			return presence.isEntering;
		},
		get isExiting() {
			return presence.isExiting;
		},
		setMotionTarget: (el) => {
			motionTarget = el;
		}
	});
</script>

{#if presence.isMounted}
	<Portal>
		{#if children}
			{@render children()}
		{/if}
	</Portal>
{/if}
