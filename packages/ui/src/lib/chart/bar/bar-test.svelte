<script lang="ts">
	import * as Chart from '../index.parts.js';
	import { scaleBand } from '../scales/band.js';

	type Row = { quarter: string; region: string; sales: number };

	let {
		layout = 'grouped',
		data = [
			{ quarter: 'Q1', region: 'North', sales: 10 },
			{ quarter: 'Q2', region: 'North', sales: 20 },
			{ quarter: 'Q3', region: 'North', sales: 30 },
			{ quarter: 'Q1', region: 'South', sales: 5 },
			{ quarter: 'Q2', region: 'South', sales: 15 },
			{ quarter: 'Q3', region: 'South', sales: 25 }
		]
	}: { layout?: 'grouped' | 'stacked'; data?: Row[] } = $props();
</script>

<Chart.Root
	id="b"
	{data}
	x="quarter"
	y="sales"
	series="region"
	xScale={{ type: scaleBand, padding: 0 }}
	yScale={{ nice: false }}
	locale="en-US"
	width={300}
	height={200}
	margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
	aria-label="Sales"
>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Bar {layout} groupPadding={0} />
	</Chart.Plot>
	<Chart.Tooltip />
</Chart.Root>
