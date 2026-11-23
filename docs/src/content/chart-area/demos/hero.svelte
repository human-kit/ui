<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';

	type Usage = { day: Date; requests: number };
	const data: Usage[] = [320, 410, 380, 520, 610, 580, 690, 720, 650, 780, 840, 810, 900, 960].map(
		(requests, i) => ({ day: new Date(2025, 5, 1 + i), requests })
	);
</script>

<Chart.Root {data} x="day" y="requests" xScale={{ type: scaleTime }} class="demo-chart">
	<Chart.Title>Requests per day</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Area />
	</Chart.Plot>
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
