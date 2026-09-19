<script lang="ts">
	import { useTooltipContext } from '../root/context';
	import type { TooltipArrowProps } from '../types';

	/**
	 * Tooltip.Arrow — the pointer of the panel toward the trigger.
	 *
	 * The panel moves it along the edge that faces the trigger, with `left` or `top`, and it
	 * writes the side in `data-placement`. The shape, the size, and the offset from the edge are
	 * for the CSS: for a panel above the trigger, `[data-placement="top"]` sits at the bottom edge.
	 */
	let { children, class: className = '', style, ...restProps }: TooltipArrowProps = $props();

	const ctx = useTooltipContext('Tooltip.Arrow');
	let arrowRef: HTMLSpanElement | null = $state(null);

	$effect(() => {
		ctx.setArrowRef(arrowRef);
		return () => {
			ctx.setArrowRef(null);
		};
	});

	const resolvedStyle = $derived(`position: absolute;${style ? ` ${style}` : ''}`);
</script>

<span
	{...restProps}
	bind:this={arrowRef}
	class={className}
	style={resolvedStyle}
	aria-hidden="true"
	data-tooltip-arrow="true"
>
	{@render children?.()}
</span>
