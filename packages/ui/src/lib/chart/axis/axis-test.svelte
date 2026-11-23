<script lang="ts">
	import * as Chart from '../index.parts.js';
	import { scaleTime } from '../scales/time.js';
	import type { ValueFormat } from '../types.js';

	type Row = { date: Date; value: number };

	let { yFormat, label = 'Value (USD)' }: { yFormat?: ValueFormat; label?: string } = $props();

	const data: Row[] = [2015, 2016, 2017, 2018, 2019, 2020].map((year, i) => ({
		date: new Date(year, 0, 1),
		value: 1000 + i * 2500
	}));
</script>

<Chart.Root
	{data}
	x="date"
	y="value"
	xScale={{ type: scaleTime }}
	{yFormat}
	locale="en-US"
	width={480}
	height={240}
	aria-label="Test"
>
	<Chart.Plot>
		<Chart.Grid axis="y" />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" {label} />
		<Chart.Line />
	</Chart.Plot>
</Chart.Root>
