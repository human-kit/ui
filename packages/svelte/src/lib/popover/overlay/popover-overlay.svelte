<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { onDestroy } from 'svelte';
	import { Portal } from '../../portal';
	import { trackMotionEnd, type MotionTracker } from '../../primitives/motion';
	import { getPopoverContext } from '../root/context';

	/**
	 * Popover.Overlay - An optional backdrop rendered behind the popover.
	 * Place it as a sibling of Popover.Content inside Popover.Root.
	 *
	 * Unlike Dialog (whose Portal shares presence with both Overlay and Content), the popover has no
	 * shared portal, so this overlay runs its own enter/exit presence off the popover's open state —
	 * keeping it mounted through its exit animation so it fades in step with the panel.
	 */
	type PopoverOverlayProps = {
		/** CSS class for the overlay. */
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class'>;

	let { class: className = '', ...restProps }: PopoverOverlayProps = $props();

	const ctx = getPopoverContext();

	if (!ctx) {
		throw new Error('Popover.Overlay must be used inside a Popover.Root');
	}

	const popoverCtx = ctx;
	const isOpen = $derived(popoverCtx.isOpen);

	let overlayRef: HTMLElement | undefined = $state();
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
			data-popover-overlay
			aria-hidden="true"
			data-state={isOpen ? 'open' : 'closed'}
			data-entering={isEntering || undefined}
			data-exiting={isExiting || undefined}
			style="position: fixed; inset: 0; z-index: 9998;"
			{...restProps}
		></div>
	</Portal>
{/if}
