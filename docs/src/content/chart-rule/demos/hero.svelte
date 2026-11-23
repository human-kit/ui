<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleBand } from '@human-kit/ui/chart/scales/band';

	type Month = { month: string; sales: number };
	const data: Month[] = [
		{ month: 'Jan', sales: 96 },
		{ month: 'Feb', sales: 104 },
		{ month: 'Mar', sales: 132 },
		{ month: 'Apr', sales: 118 },
		{ month: 'May', sales: 141 },
		{ month: 'Jun', sales: 127 }
	];
	const target = 130;
	const average = data.reduce((sum, m) => sum + m.sales, 0) / data.length;
</script>

<Chart.Root
	{data}
	x="month"
	y="sales"
	yLabel="Sales"
	xScale={{ type: scaleBand }}
	yFormat={{ maximumFractionDigits: 0 }}
	class="demo-chart"
>
	<Chart.Title>Sales per month, in units</Chart.Title>
	<Chart.Plot>
		<!-- The rules come first: their values are then in the domain on the server too. -->
		<Chart.Rule
			value={target}
			label="Target"
			compare={(point, value) => (point.y >= value ? 'at target' : 'below target')}
		/>
		<Chart.Rule value={average} label="Average" />
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Bar />
	</Chart.Plot>
	<Chart.Tooltip />
	<Chart.DataTable visibility="visible" />
</Chart.Root>
