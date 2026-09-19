<script lang="ts">
	import { floating, type FloatingAnchor } from '../../primitives/floating';
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
		followPointer,
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
	// The last position of the pointer on the trigger, for a panel that follows it. Null while
	// the pointer was never on the trigger: a keyboard focus opened the tooltip.
	let pointerPosition = $state<{ x: number; y: number } | null>(null);

	$effect(() => {
		element = contentRef;
		ctx.setContentRef(contentRef);
		return () => {
			ctx.setContentRef(null);
		};
	});

	function resolvePlacementSide(value: string) {
		const side = value.split(/[-\s]/)[0];
		return side === 'top' || side === 'right' || side === 'left' ? side : 'bottom';
	}

	// A panel that follows the pointer is anchored to a point on the trigger: the pointer on
	// the axes that follow, and the extent of the trigger on the axis that does not.
	$effect(() => {
		const trigger = ctx.triggerRef;
		if (!trigger || !followPointer) {
			pointerPosition = null;
			return;
		}
		const handleMove = (event: PointerEvent) => {
			if (event.pointerType === 'touch') return;
			pointerPosition = { x: event.clientX, y: event.clientY };
		};
		trigger.addEventListener('pointermove', handleMove);
		return () => {
			trigger.removeEventListener('pointermove', handleMove);
		};
	});

	const anchor = $derived.by<FloatingAnchor>(() => {
		const trigger = ctx.triggerRef;
		if (!trigger || !followPointer || !pointerPosition) return trigger;
		const { x, y } = pointerPosition;
		const axis = followPointer;
		return {
			contextElement: trigger,
			getBoundingClientRect() {
				const rect = trigger.getBoundingClientRect();
				const left = axis === 'y' ? rect.left : x;
				const top = axis === 'x' ? rect.top : y;
				const width = axis === 'y' ? rect.width : 0;
				const height = axis === 'x' ? rect.height : 0;
				return new DOMRect(left, top, width, height);
			}
		};
	});

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
				anchor,
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
