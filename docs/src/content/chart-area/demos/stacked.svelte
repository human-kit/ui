<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';

	type Traffic = { month: Date; source: string; visits: number };
	const sources: Record<string, number[]> = {
		Search: [30, 34, 33, 38, 42, 45, 44, 49],
		Direct: [12, 14, 15, 15, 18, 20, 22, 21],
		Social: [6, 9, 8, 12, 11, 15, 17, 19]
	};
	const data: Traffic[] = Object.entries(sources).flatMap(([source, values]) =>
		values.map((visits, i) => ({ month: new Date(2025, i, 1), source, visits }))
	);

	let stacked = $state(true);
</script>

<div class="flex w-full flex-col gap-3">
	<label class="flex items-center gap-2 text-sm text-foreground">
		<input type="checkbox" bind:checked={stacked} />
		Stacked
	</label>
	<Chart.Root
		{data}
		x="month"
		y="visits"
		series="source"
		xScale={{ type: scaleTime }}
		class="demo-chart"
	>
		<Chart.Title>Visits per source, in thousands</Chart.Title>
		<Chart.Plot>
			<!-- Before the guides: on the server, a guide sees only the values of the marks before it. -->
			<Chart.Area {stacked} />
			<Chart.Grid />
			<Chart.Axis position="bottom" />
			<Chart.Axis position="left" />
		</Chart.Plot>
		<Chart.Legend />
		<Chart.Tooltip />
		<Chart.DataTable />
	</Chart.Root>
</div>
