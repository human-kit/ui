<script lang="ts">
	import * as Chart from '../index.parts.js';
	import { scaleBand } from '../scales/band.js';
	import type { ChartBarProps } from '../types.js';

	type Row = { bucket: string; amount: number };

	let {
		radius = 0,
		labels = false,
		vertical = false
	}: {
		radius?: number;
		labels?: ChartBarProps<Row>['labels'];
		vertical?: boolean;
	} = $props();

	const data: Row[] = [
		{ bucket: 'Current', amount: 40 },
		{ bucket: '30 days', amount: 20 },
		{ bucket: '60 days', amount: -10 },
		{ bucket: '90 days', amount: 30 },
		{ bucket: '120 days', amount: 5 },
		{ bucket: 'Older', amount: 15 }
	];
</script>

{#if vertical}
	<Chart.Root
		{data}
		x="bucket"
		y="amount"
		xScale={{ type: scaleBand }}
		locale="en-US"
		width={360}
		height={160}
		aria-label="Balance by age"
	>
		<Chart.Plot>
			<Chart.Bar {radius} {labels} />
		</Chart.Plot>
	</Chart.Root>
{:else}
	<Chart.Root
		{data}
		x="amount"
		y="bucket"
		yScale={{ type: scaleBand }}
		locale="en-US"
		width={360}
		height={120}
		aria-label="Balance by age"
	>
		<Chart.Plot>
			<Chart.Bar {radius} {labels} />
			<Chart.Axis position="left" tickSize={0} />
		</Chart.Plot>
	</Chart.Root>
{/if}
