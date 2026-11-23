<script lang="ts">
	import { useChartContext } from '../root/context.js';
	import type { ChartTitleProps } from '../types.js';

	let { children, class: className = '', ...restProps }: ChartTitleProps = $props();

	const ctx = useChartContext('Chart.Title');
	const id = `chart-${ctx.instanceId}-title`;
	ctx.titleId = id;
	$effect(() => () => {
		if (ctx.titleId === id) ctx.titleId = null;
	});
</script>

<!-- Chart.Title is always a child of the <figure> of Chart.Root. -->
<!-- svelte-ignore a11y_figcaption_parent -->
<figcaption {id} class={className} {...restProps}>{@render children?.()}</figcaption>
