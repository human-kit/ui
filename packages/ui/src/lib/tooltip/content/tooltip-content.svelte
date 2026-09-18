<script lang="ts">
	import { floating } from '../../primitives/floating';
	import { getFloatingLayerZIndex } from '../../primitives/layer-stack';
	import { createPresence } from '../../primitives/presence.svelte';
	import { Portal } from '../../portal';
	import { useTooltipContext } from '../root/context';
	import type { TooltipContentProps } from '../types';

	/**
	 * Tooltip.Content — the floating panel with the description.
	 *
	 * It is `role="tooltip"`, and the trigger points at it with `aria-describedby` while it is in
	 * the DOM. It takes no focus and it holds no control: a screen reader reads it as a
	 * description of the trigger, and nothing else. The pointer can rest on it, thus the user can
	 * read it to the end.
	 */
	let {
		offset = 8,
		placement = 'top',
		shouldFlip = true,
		boundaryElement = null,
		children,
		class: className = '',
		element = $bindable<HTMLDivElement | null>(null),
		onpointerenter,
		onpointerleave,
		...restProps
	}: TooltipContentProps = $props();

	const ctx = useTooltipContext('Tooltip.Content');

	let contentRef: HTMLDivElement | null = $state(null);
	let resolvedPlacement = $state<'top' | 'right' | 'bottom' | 'left'>('top');
	// Resolved when the tooltip opens, thus it draws above the topmost dialog of that moment.
	let zIndex = $state(getFloatingLayerZIndex());

	$effect(() => {
		element = contentRef;
	});

	function resolvePlacementSide(value: string) {
		const side = value.split(/[-\s]/)[0];
		return side === 'top' || side === 'right' || side === 'left' ? side : 'bottom';
	}

	function handlePointerEnter(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerenter?.(event);
		ctx.handleContentPointerEnter(event);
	}

	function handlePointerLeave(
		event: PointerEvent & { currentTarget: EventTarget & HTMLDivElement }
	) {
		onpointerleave?.(event);
		ctx.handleContentPointerLeave(event);
	}

	// Mounted through the exit animation, with the phases timed from the CSS motion of the panel.
	const presence = createPresence(
		() => ctx.isOpen,
		() => contentRef,
		{
			onOpen: () => {
				zIndex = getFloatingLayerZIndex();
			}
		}
	);
</script>

{#if presence.isMounted}
	<Portal>
		<div
			{...restProps}
			bind:this={contentRef}
			id={ctx.contentId}
			role="tooltip"
			class={className}
			aria-hidden={ctx.isOpen ? undefined : 'true'}
			data-tooltip-content="true"
			data-state={ctx.isOpen ? 'open' : 'closed'}
			data-entering={presence.isEntering || undefined}
			data-exiting={presence.isExiting || undefined}
			data-placement={resolvedPlacement}
			use:floating={{
				anchor: ctx.triggerRef,
				offset,
				placement,
				shouldFlip,
				boundaryElement,
				arrow: ctx.arrowRef,
				onPositionUpdate: (_, __, finalPlacement) => {
					resolvedPlacement = resolvePlacementSide(finalPlacement);
				}
			}}
			style="position: fixed; z-index: {zIndex};"
			onpointerenter={handlePointerEnter}
			onpointerleave={handlePointerLeave}
		>
			{@render children?.()}
		</div>
	</Portal>
{/if}
