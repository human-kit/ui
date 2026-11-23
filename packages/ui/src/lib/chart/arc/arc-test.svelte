<script lang="ts">
	import * as Chart from '../index.parts.js';
	import { scaleBand } from '../scales/band.js';

	type Row = { region: string; sales: number };

	let {
		inner = 0,
		labels = false,
		data = [
			{ region: 'North', sales: 50 },
			{ region: 'East', sales: 25 },
			{ region: 'South', sales: 0 },
			{ region: 'West', sales: 25 },
			{ region: 'Lost', sales: -5 }
		]
	}: { inner?: number; labels?: boolean; data?: Row[] } = $props();
</script>

<Chart.Root
	id="a"
	{data}
	x="region"
	y="sales"
	yLabel="Sales"
	xScale={{ type: scaleBand }}
	locale="en-US"
	width={200}
	height={200}
	margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
	style="width: 200px"
>
	<Chart.Title>Sales by region</Chart.Title>
	<Chart.Plot>
		<Chart.Arc {inner} {labels} />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
