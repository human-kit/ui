<script lang="ts">
	import * as Chart from '../index.parts.js';
	import { scaleBand } from '../scales/band.js';

	type Row = { month: string; product: string; units: number };

	let {
		stacked = true,
		visibility = 'screen-reader',
		caption,
		long = false,
		follow = false,
		wide = false
	}: {
		stacked?: boolean;
		visibility?: 'visible' | 'screen-reader';
		caption?: string;
		long?: boolean;
		follow?: boolean;
		wide?: boolean;
	} = $props();

	const data: Row[] = [
		{ month: 'Jan', product: 'Tea', units: 10 },
		{ month: 'Feb', product: 'Tea', units: 20 },
		{ month: 'Mar', product: 'Tea', units: 30 },
		{ month: 'Jan', product: 'Coffee', units: 5 },
		{ month: 'Feb', product: 'Coffee', units: 10 },
		{ month: 'Mar', product: 'Coffee', units: 15 }
	];
</script>

<Chart.Root
	{data}
	x="month"
	y="units"
	series="product"
	xScale={{ type: scaleBand, padding: 0 }}
	yScale={{ nice: false }}
	locale="en-US"
	width={300}
	height={200}
	margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
	style="width: 300px"
>
	<Chart.Title>Units per month</Chart.Title>
	<Chart.Plot>
		<Chart.Area {stacked} />
	</Chart.Plot>
	<Chart.Legend />
	{#if long}
		<Chart.Tooltip>
			{#snippet children(tip)}<div style="width: 160px">{tip.xText}, a long text</div>{/snippet}
		</Chart.Tooltip>
	{:else}
		<!-- Narrow, thus the edges of the figure do not move it. -->
		<Chart.Tooltip {follow} style="width: {wide ? 200 : 40}px" />
	{/if}
	<Chart.DataTable {visibility} {caption} />
</Chart.Root>
