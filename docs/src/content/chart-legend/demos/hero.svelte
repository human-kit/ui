<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleBand } from '@human-kit/ui/chart/scales/band';

	type Score = { test: string; device: string; score: number };
	const devices: Record<string, number[]> = {
		Desktop: [92, 88, 95],
		Tablet: [85, 80, 90],
		Phone: [71, 69, 78]
	};
	const data: Score[] = Object.entries(devices).flatMap(([device, values]) =>
		['Speed', 'Layout', 'Access'].map((test, i) => ({ test, device, score: values[i] }))
	);
</script>

<Chart.Root
	{data}
	x="test"
	y="score"
	series="device"
	xScale={{ type: scaleBand }}
	height={240}
	class="demo-chart"
>
	<Chart.Title>Audit scores per device</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Bar />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
