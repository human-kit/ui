<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleBand } from '@human-kit/ui/chart/scales/band';

	type Source = { source: string; energy: number };
	// The rows go from the largest value to the smallest, thus the slices do too.
	const data: Source[] = [
		{ source: 'Solar', energy: 412 },
		{ source: 'Wind', energy: 296 },
		{ source: 'Hydro', energy: 231 },
		{ source: 'Gas', energy: 148 }
	];
</script>

<Chart.Root
	{data}
	x="source"
	y="energy"
	yLabel="Energy (GWh)"
	xScale={{ type: scaleBand }}
	height={260}
	class="demo-chart"
>
	<Chart.Title>Energy of the city by source in 2025</Chart.Title>
	<Chart.Plot>
		<Chart.Arc inner={0.6} labels />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
