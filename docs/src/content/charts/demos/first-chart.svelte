<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';

	type Visit = { month: Date; visits: number };
	const data: Visit[] = [12, 15, 14, 18, 22, 21, 25, 27, 26, 30, 33, 35].map((visits, i) => ({
		month: new Date(2025, i, 1),
		visits
	}));
</script>

<Chart.Root {data} x="month" y="visits" xScale={{ type: scaleTime }} class="demo-chart">
	<Chart.Title>Visits to the docs in 2025</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" label="Visits (thousands)" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
