<script lang="ts">
	import * as Chart from '../index.parts.js';
	import type { ChartPoint } from '../root/context.js';
	import { scaleBand } from '../scales/band.js';

	type Row = { team: string; year: string; goals: number };

	let {
		layout = 'grouped',
		measure = false
	}: { layout?: 'grouped' | 'stacked'; measure?: boolean } = $props();

	const data: Row[] = [
		{ team: 'Red', year: '2024', goals: 10 },
		{ team: 'Blue', year: '2024', goals: 20 },
		{ team: 'Red', year: '2025', goals: 30 },
		{ team: 'Blue', year: '2025', goals: 10 }
	];

	let selected: ChartPoint<Row> | null = $state(null);
</script>

<Chart.Root
	{data}
	x="goals"
	y="team"
	series="year"
	yScale={{ type: scaleBand, padding: 0 }}
	xScale={{ nice: false }}
	locale="en-US"
	width={300}
	height={200}
	margin={measure ? undefined : { top: 0, right: 0, bottom: 0, left: 0 }}
	bind:selected
>
	<Chart.Title>Goals per team</Chart.Title>
	<Chart.Plot>
		<Chart.Axis position="left" />
		{#if measure}
			<Chart.Axis position="bottom" />
		{/if}
		<Chart.Bar {layout} groupPadding={0} />
	</Chart.Plot>
	<Chart.DataTable visibility="visible" />
</Chart.Root>
<output data-testid="selected">{selected ? `${selected.datum.team}:${selected.series}` : ''}</output
>
