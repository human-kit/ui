<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Portal } from '../../portal';
	import { createPresence } from '../../primitives/presence.svelte';
	import { getPopoverContext } from '../root/context';
	import { getFloatingLayerOverlayZIndex } from '../../primitives/layer-stack';

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
	// Stacks above the topmost dialog (mirrors the content layer), not a fixed value.
	let zIndex = $state(getFloatingLayerOverlayZIndex());

	// Mounted through the exit animation; each phase ends when the backdrop's own motion finishes.
	const presence = createPresence(
		() => isOpen,
		() => overlayRef,
		{
			onOpen: () => {
				// Re-resolve only on a fresh mount — reopening mid-exit keeps the captured level.
				if (!presence.isMounted) {
					zIndex = getFloatingLayerOverlayZIndex();
				}
			}
		}
	);
</script>

{#if presence.isMounted}
	<Portal>
		<div
			bind:this={overlayRef}
			class={className}
			data-popover-overlay
			aria-hidden="true"
			data-state={isOpen ? 'open' : 'closed'}
			data-entering={presence.isEntering || undefined}
			data-exiting={presence.isExiting || undefined}
			style="position: fixed; inset: 0; z-index: {zIndex};"
			{...restProps}
		></div>
	</Portal>
{/if}
