<script lang="ts">
	import * as Chart from '../index.parts.js';
	import { scaleBand } from '../scales/band.js';
	import type { ChartRuleProps, ScaleOptions } from '../types.js';

	type Month = { month: string; sales: number; region?: string };

	let {
		rules = [{ value: 130, label: 'Target' }],
		yScale,
		describedBy,
		series,
		data = [
			{ month: 'Jan', sales: 40 },
			{ month: 'Feb', sales: 60 },
			{ month: 'Mar', sales: 20 }
		]
	}: {
		rules?: ChartRuleProps[];
		yScale?: ScaleOptions;
		describedBy?: string;
		series?: 'region';
		data?: Month[];
	} = $props();
</script>

<Chart.Root
	id="r"
	{data}
	x="month"
	y="sales"
	{series}
	yLabel="Sales"
	xScale={{ type: scaleBand }}
	{yScale}
	locale="en-US"
	width={300}
	height={200}
	margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
	aria-describedby={describedBy}
	style="width: 300px"
>
	<Chart.Title>Sales per month</Chart.Title>
	<Chart.Plot>
		{#each rules as rule, i (i)}
			<Chart.Rule {...rule} />
		{/each}
		<Chart.Bar />
	</Chart.Plot>
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
{#if describedBy}<p id={describedBy}>Three months of sales.</p>{/if}
<button>After</button>
