<script lang="ts">
	import { Chart } from '@human-kit/ui';

	type Run = { distance: number; pace: number };
	const data: Run[] = [5.2, 5.1, 5.3, 5.0, 4.9, 5.1, 4.8, 4.7, 4.9, 4.6].map((pace, i) => ({
		distance: (i + 1) * 2,
		pace
	}));
</script>

<Chart.Root
	{data}
	x="distance"
	y="pace"
	yScale={{ zero: false }}
	yFormat={(pace) => `${pace} min`}
	height={260}
	class="demo-chart"
>
	<Chart.Title>Pace per kilometer in a race</Chart.Title>
	<Chart.Plot>
		<Chart.Grid axis="x" />
		<Chart.Grid axis="y" />
		<Chart.Axis position="bottom" label="Distance (km)" />
		<Chart.Axis position="left" label="Pace (minutes per km)" />
		<Chart.Axis position="right" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
