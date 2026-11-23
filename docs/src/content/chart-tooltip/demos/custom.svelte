<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleBand } from '@human-kit/ui/chart/scales/band';

	type Budget = { team: string; kind: string; amount: number; owner: string };
	const data: Budget[] = [
		{ team: 'Design', kind: 'Spent', amount: 42, owner: 'Ana' },
		{ team: 'Product', kind: 'Spent', amount: 58, owner: 'Luis' },
		{ team: 'Support', kind: 'Spent', amount: 31, owner: 'Mia' },
		{ team: 'Design', kind: 'Left', amount: 18, owner: 'Ana' },
		{ team: 'Product', kind: 'Left', amount: 7, owner: 'Luis' },
		{ team: 'Support', kind: 'Left', amount: 24, owner: 'Mia' }
	];
</script>

<Chart.Root
	{data}
	x="team"
	y="amount"
	series="kind"
	xScale={{ type: scaleBand }}
	yFormat={{ style: 'currency', currency: 'USD', notation: 'compact' }}
	height={240}
	class="demo-chart"
>
	<Chart.Title>Budget per team, in thousands of USD</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Bar layout="stacked" />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip>
		{#snippet children({ point, xText, yText })}
			<div data-tooltip-key="">{xText}: {point.series}</div>
			<div>{yText}</div>
			<div class="opacity-75">Owner: {(point.datum as Budget).owner}</div>
		{/snippet}
	</Chart.Tooltip>
	<Chart.DataTable />
</Chart.Root>
