<script lang="ts">
	import { Chart, type ChartPoint } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';

	type Visit = { month: Date; site: string; visits: number };
	const visits: Record<string, number[]> = {
		Docs: [12, 15, 14, 18, 22, 21, 25, 27, 26, 30, 33, 35],
		Blog: [8, 9, 11, 10, 12, 14, 13, 15, 17, 16, 18, 20]
	};
	const data: Visit[] = Object.entries(visits).flatMap(([site, values]) =>
		values.map((value, i) => ({ month: new Date(2025, i, 1), site, visits: value }))
	);

	let focused: ChartPoint<Visit> | null = $state(null);
	let selected: ChartPoint<Visit> | null = $state(null);

	const describe = (point: ChartPoint<Visit> | null) =>
		point
			? `${point.series}, ${point.datum.month.toLocaleString('en', { month: 'long' })}, ${point.datum.visits}`
			: 'none';
</script>

<div class="flex w-full flex-col gap-3">
	<Chart.Root
		{data}
		x="month"
		y="visits"
		series="site"
		xScale={{ type: scaleTime }}
		bind:focused
		bind:selected
		class="demo-chart"
	>
		<Chart.Title>Visits per month, in thousands</Chart.Title>
		<Chart.Plot>
			<Chart.Grid />
			<Chart.Axis position="bottom" />
			<Chart.Axis position="left" />
			<Chart.Line />
		</Chart.Plot>
		<Chart.Legend />
		<Chart.Tooltip />
		<Chart.DataTable />
	</Chart.Root>
	<dl class="grid grid-cols-[auto_1fr] gap-x-3 text-sm text-muted-foreground">
		<dt>Focused</dt>
		<dd class="text-foreground">{describe(focused)}</dd>
		<dt>Selected</dt>
		<dd class="text-foreground">{describe(selected)}</dd>
	</dl>
</div>
