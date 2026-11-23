<script lang="ts">
	import * as Chart from '../index.parts.js';
	import type { ChartPoint, ChartValue } from '../root/context.js';

	type Row = { x: number; y: number | null; s: string };

	let {
		data = [
			{ x: 1, y: 10, s: 'A' },
			{ x: 2, y: 20, s: 'A' },
			{ x: 3, y: 15, s: 'A' },
			{ x: 1, y: 5, s: 'B' },
			{ x: 3, y: 8, s: 'B' }
		],
		onSelect,
		xFormat,
		key
	}: {
		data?: Row[];
		key?: 'x';
		onSelect?: (point: ChartPoint<Row>) => void;
		xFormat?: (value: ChartValue) => string;
	} = $props();

	let focused: ChartPoint<Row> | null = $state(null);
</script>

<button data-testid="before">Before</button>
<Chart.Root
	id="t"
	{data}
	x="x"
	y="y"
	series="s"
	{key}
	width={400}
	height={200}
	bind:focused
	{onSelect}
	{xFormat}
>
	<Chart.Title>Test chart</Chart.Title>
	<Chart.Plot data-testid="plot">
		<Chart.Line />
	</Chart.Plot>
</Chart.Root>
<button data-testid="after">After</button>
<output data-testid="focused">{focused ? `${focused.series}:${focused.x}` : ''}</output>
