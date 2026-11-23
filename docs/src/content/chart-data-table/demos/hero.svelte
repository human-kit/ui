<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';

	type Energy = { month: Date; source: string; output: number };
	const sources: Record<string, number[]> = {
		Solar: [12, 18, 26, 31, 35, 33],
		Wind: [28, 25, 22, 19, 17, 21]
	};
	const data: Energy[] = Object.entries(sources).flatMap(([source, values]) =>
		values.map((output, i) => ({ month: new Date(2025, i, 1), source, output }))
	);
</script>

<Chart.Root
	{data}
	x="month"
	y="output"
	series="source"
	xScale={{ type: scaleTime }}
	xFormat={{ month: 'short' }}
	height={220}
	class="demo-chart"
>
	<Chart.Title>Energy output, in megawatt hours</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable visibility="visible" rowHeader="Month" />
</Chart.Root>
