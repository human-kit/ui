<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { onDestroy } from 'svelte';
	import { Portal } from '../../portal';
	import { trackMotionEnd, type MotionTracker } from '../../primitives/motion';
	import { useMenuContext } from '../root/context';
	import { getFloatingLayerOverlayZIndex } from '../../dialog/root/dialog-stack';

	/**
	 * Menu.Overlay - An optional backdrop rendered behind the menu.
	 * Place it as a sibling of Menu.Content inside Menu.Root.
	 *
	 * Mirrors Popover.Overlay: the menu has no shared portal, so this overlay runs its own
	 * enter/exit presence off the menu's open state — staying mounted through its exit animation
	 * so it fades in step with the panel. In a submenu chain only the root menu should render one;
	 * a nested overlay would just stack a second dim layer, so callers place it at the root level.
	 */
	type MenuOverlayProps = {
		/** CSS class for the overlay. */
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class'>;

	let { class: className = '', ...restProps }: MenuOverlayProps = $props();

	const ctx = useMenuContext('Menu.Overlay');

	const isOpen = $derived(ctx.isOpen);

	let overlayRef: HTMLElement | undefined = $state();
	// Resolved on open so the backdrop sits just below the menu panel and above the dialog
	// it was opened within (mirrors Popover.Overlay).
	let zIndex = $state(getFloatingLayerOverlayZIndex());
	let isMounted = $state(false);
	let isEntering = $state(false);
	let isExiting = $state(false);
	let tracker: MotionTracker | undefined;

	function clearTracker() {
		tracker?.cancel();
		tracker = undefined;
	}

	// Mount on open; flip to the exit phase on close while staying mounted for the animation.
	$effect(() => {
		if (isOpen) {
			zIndex = getFloatingLayerOverlayZIndex();
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

	// End each phase once the backdrop's own motion finishes — unmounting after exit.
	$effect(() => {
		if (!isMounted || !overlayRef) {
			clearTracker();
			return;
		}

		if (isEntering) {
			clearTracker();
			tracker = trackMotionEnd(overlayRef, () => {
				isEntering = false;
			});
			return;
		}

		if (isExiting) {
			clearTracker();
			tracker = trackMotionEnd(overlayRef, () => {
				isExiting = false;
				isMounted = false;
			});
			return;
		}

		clearTracker();
	});

	onDestroy(() => {
		clearTracker();
	});
</script>

{#if isMounted}
	<Portal>
		<div
			bind:this={overlayRef}
			class={className}
			data-menu-overlay
			aria-hidden="true"
			data-state={isOpen ? 'open' : 'closed'}
			data-entering={isEntering || undefined}
			data-exiting={isExiting || undefined}
			style="position: fixed; inset: 0; z-index: {zIndex};"
			{...restProps}
		></div>
	</Portal>
{/if}
