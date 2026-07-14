<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { Portal } from '../../portal';
	import { createPresence } from '../../primitives/presence.svelte';
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

	// Mounted through the exit animation; each phase ends when the backdrop's own motion finishes.
	const presence = createPresence(
		() => isOpen,
		() => overlayRef,
		{
			onOpen: () => {
				zIndex = getFloatingLayerOverlayZIndex();
			}
		}
	);
</script>

{#if presence.isMounted}
	<Portal>
		<div
			bind:this={overlayRef}
			class={className}
			data-menu-overlay
			aria-hidden="true"
			data-state={isOpen ? 'open' : 'closed'}
			data-entering={presence.isEntering || undefined}
			data-exiting={presence.isExiting || undefined}
			style="position: fixed; inset: 0; z-index: {zIndex};"
			{...restProps}
		></div>
	</Portal>
{/if}
