<script lang="ts">
	import { Chart } from '@human-kit/ui';

	type Week = { week: number; tickets: number };
	const actual: Week[] = [14, 18, 17, 23, 21, 26, 24, 29].map((tickets, i) => ({
		week: i + 1,
		tickets
	}));
	// A second set of rows, with other field names. The line of the target uses them.
	type Goal = { week: number; goal: number };
	const target: Goal[] = [
		{ week: 1, goal: 15 },
		{ week: 8, goal: 30 }
	];
</script>

<Chart.Root
	data={actual}
	x="week"
	y="tickets"
	xFormat={(week) => `Week ${week}`}
	height={240}
	class="demo-chart"
>
	<Chart.Title>Closed tickets per week</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Line name="Closed" />
		<Chart.Line data={target} x="week" y="goal" name="Target" r={0} />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
