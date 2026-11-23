<script lang="ts">
	import * as Chart from '../index.parts.js';
	import type { Channel } from '../internal/channel.js';
	import type { ChartSymbol } from '../internal/symbol.js';
	import type { ChartValue } from '../root/context.js';

	type Row = { w: number; v: number; s: string };

	let {
		symbol = 'auto',
		data = [
			{ w: 3, v: 30, s: 'A' },
			{ w: 1, v: 10, s: 'A' },
			{ w: 2, v: 25, s: 'A' },
			{ w: 2, v: 20, s: 'A' },
			{ w: 2, v: 5, s: 'B' },
			{ w: 1, v: 15, s: 'B' },
			{ w: 4, v: 32, s: 'B' }
		],
		key
	}: { symbol?: 'auto' | ChartSymbol; data?: Row[]; key?: Channel<Row, ChartValue> } = $props();
</script>

<Chart.Root
	id="d"
	{data}
	x="w"
	y="v"
	series="s"
	{key}
	xLabel="Weight"
	yLabel="Speed"
	xScale={{ domain: [0, 4] }}
	yScale={{ domain: [0, 40] }}
	locale="en-US"
	width={300}
	height={200}
	margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
	style="width: 300px"
>
	<Chart.Title>Weight and speed</Chart.Title>
	<Chart.Plot>
		<Chart.Axis position="bottom" />
		<Chart.Dot {symbol} />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
