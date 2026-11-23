<script lang="ts">
	import { useChartContext } from '../root/context.js';
	import type { ChartPlotProps } from '../types.js';

	let {
		children,
		class: className = '',
		element = $bindable<SVGSVGElement | null>(null),
		...restProps
	}: ChartPlotProps = $props();

	const ctx = useChartContext('Chart.Plot');
	$effect(() => {
		ctx.plotElement = element;
	});
</script>

<!--
	The handlers act on the focused point: the points are the interactive elements.
	`application` makes a screen reader go into focus mode on a point, thus the arrow keys come to
	the chart. With `group`, a screen reader in browse mode keeps the arrow keys for itself.
	Before the first measure, the SVG fills its container: on a narrow screen, the default width
	must not make the page wider.
-->
<svg
	bind:this={element}
	class={className}
	width={ctx.fluid ? '100%' : ctx.width}
	height={ctx.height}
	viewBox="0 0 {ctx.width} {ctx.height}"
	role="application"
	aria-roledescription="chart"
	{...ctx.labels}
	data-plot=""
	{...restProps}
	{...ctx.plotHandlers}
>
	{@render children?.()}
</svg>
