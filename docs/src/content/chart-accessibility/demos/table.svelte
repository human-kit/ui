<script lang="ts">
	import { Chart, type ChartPoint } from '@human-kit/ui';
	import { scaleBand } from '@human-kit/ui/chart/scales/band';

	type Sale = { quarter: string; region: string; sales: number };
	const data: Sale[] = [
		{ quarter: 'Q1', region: 'North', sales: 24 },
		{ quarter: 'Q2', region: 'North', sales: 31 },
		{ quarter: 'Q3', region: 'North', sales: 28 },
		{ quarter: 'Q4', region: 'North', sales: 36 },
		{ quarter: 'Q1', region: 'South', sales: 18 },
		{ quarter: 'Q2', region: 'South', sales: 22 },
		{ quarter: 'Q3', region: 'South', sales: 27 },
		{ quarter: 'Q4', region: 'South', sales: 25 }
	];

	let selected: ChartPoint<Sale> | null = $state(null);
</script>

<Chart.Root
	{data}
	x="quarter"
	y="sales"
	series="region"
	xScale={{ type: scaleBand }}
	bind:selected
	height={240}
	class="demo-chart"
>
	<Chart.Title>Sales per quarter, in units</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Bar />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable visibility="visible" rowHeader="Quarter" />
</Chart.Root>
