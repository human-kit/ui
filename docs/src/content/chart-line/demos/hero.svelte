<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';

	type Download = { year: Date; package: string; downloads: number };
	const downloads: Record<string, number[]> = {
		Core: [40, 46, 55, 61, 72, 80, 94, 103],
		Icons: [22, 27, 30, 38, 41, 49, 52, 60],
		Forms: [10, 12, 18, 21, 29, 33, 41, 48]
	};
	const data: Download[] = Object.entries(downloads).flatMap(([name, values]) =>
		values.map((value, i) => ({ year: new Date(2018 + i, 0, 1), package: name, downloads: value }))
	);
</script>

<Chart.Root
	{data}
	x="year"
	y="downloads"
	series="package"
	xScale={{ type: scaleTime }}
	class="demo-chart"
>
	<Chart.Title>Downloads per year, in thousands</Chart.Title>
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
