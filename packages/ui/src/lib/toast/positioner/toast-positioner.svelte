<script lang="ts">
	import { floating, type ExtendedPlacement } from '../../primitives/floating';
	import { getFloatingLayerZIndex } from '../../primitives/layer-stack';
	import { useToastProviderContext } from '../provider/context';
	import type { ToastPositionerProps } from '../types.js';

	/**
	 * Toast.Positioner — puts a toast against the `anchor` of its item.
	 *
	 * Put it around `Toast.Root` in the viewport snippet. For a toast without an anchor, it is a
	 * plain wrapper, thus one snippet serves both kinds. For a toast with one, it is a fixed
	 * element that follows the anchor, flips when the space is not sufficient, and draws above
	 * the topmost dialog of the moment.
	 */
	let {
		toast,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		style,
		...restProps
	}: ToastPositionerProps = $props();

	useToastProviderContext('Toast.Positioner');

	let positionerRef: HTMLDivElement | null = $state(null);
	let resolvedPlacement = $state<string | undefined>(undefined);
	// Resolved when the toast appears, thus it draws above the topmost dialog of that moment.
	const zIndex = getFloatingLayerZIndex();

	const anchor = $derived(toast.anchor && toast.anchor.isConnected ? toast.anchor : null);
	const placement = $derived<ExtendedPlacement>(toast.placement ?? 'top');

	$effect(() => {
		element = positionerRef;
	});

	function resolvePlacementSide(value: string) {
		const side = value.split(/[-\s]/)[0];
		return side === 'top' || side === 'right' || side === 'left' ? side : 'bottom';
	}
</script>

{#if anchor}
	<div
		{...restProps}
		bind:this={positionerRef}
		class={className}
		style="position: fixed; z-index: {zIndex};{style ? ` ${style}` : ''}"
		data-toast-positioner="true"
		data-anchored="true"
		data-placement={resolvedPlacement}
		use:floating={{
			anchor,
			placement,
			offset: toast.offset ?? 8,
			onPositionUpdate: (_, __, finalPlacement) => {
				resolvedPlacement = resolvePlacementSide(finalPlacement);
			}
		}}
	>
		{@render children?.()}
	</div>
{:else}
	<!-- Out of the layout: the root keeps its place in the stack of the viewport. -->
	<div
		{...restProps}
		bind:this={positionerRef}
		class={className}
		style="display: contents;{style ? ` ${style}` : ''}"
		data-toast-positioner="true"
	>
		{@render children?.()}
	</div>
{/if}
