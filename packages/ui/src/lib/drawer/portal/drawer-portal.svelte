<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Portal } from '../../portal';
	import { createPresence } from '../../primitives/presence.svelte';
	import { requireDrawerContext } from '../root/context';
	import { setDrawerPresenceContext } from '../root/presence-context';

	/**
	 * Drawer.Portal — renders the overlay and panel outside the app's DOM position
	 * while the drawer is open, keeping them mounted through the exit animation so
	 * it can play before they leave.
	 */
	type DrawerPortalProps = {
		/** The layers to portal (Overlay, Viewport/Content). */
		children?: Snippet;
	};

	let { children }: DrawerPortalProps = $props();

	const ctx = requireDrawerContext('Drawer.Portal');

	// `isMounted` outlives `isOpen` by one exit animation. The duration is measured
	// from the Content element (registered via setMotionTarget), so the timing follows
	// the consumer's CSS and collapses to a single frame under prefers-reduced-motion.
	// When no Content ever registers, the exit resolves immediately rather than leaving
	// the portal mounted forever. Starts mounted when created while already open.
	let motionTarget = $state<HTMLElement | null>(null);

	const presence = createPresence(
		() => ctx.isOpen,
		() => motionTarget,
		{ initiallyMounted: ctx.isOpen }
	);

	setDrawerPresenceContext({
		get state() {
			return ctx.isOpen ? 'open' : 'closed';
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
