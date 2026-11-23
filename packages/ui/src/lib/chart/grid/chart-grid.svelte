<script lang="ts">
	import { useChartContext } from '../root/context.js';
	import type { ChartGridProps } from '../types.js';

	let { axis = 'y', class: className = '' }: ChartGridProps = $props();

	const ctx = useChartContext('Chart.Grid');
	const ticks = $derived(axis === 'x' ? ctx.xTicks : ctx.yTicks);
	// A grid line goes across the plot: the range of the other axis.
	const across = $derived(axis === 'x' ? ctx.yScale.range : ctx.xScale.range);
</script>

<g class={className} aria-hidden="true" data-grid={axis} stroke="currentColor">
	{#each ticks as tick (tick.value)}
		<line
			x1={axis === 'x' ? tick.position : across[0]}
			x2={axis === 'x' ? tick.position : across[1]}
			y1={axis === 'x' ? across[0] : tick.position}
			y2={axis === 'x' ? across[1] : tick.position}
		/>
	{/each}
</g>
