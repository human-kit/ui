<script lang="ts">
	import * as Chart from '../index.parts.js';
	import { scaleTime } from '../scales/time.js';

	type Day = { day: Date; visits: number };

	let { value = new Date(Date.UTC(2026, 0, 3)) }: { value?: Date } = $props();

	const data: Day[] = [
		{ day: new Date(Date.UTC(2026, 0, 1)), visits: 10 },
		{ day: new Date(Date.UTC(2026, 0, 5)), visits: 30 }
	];
</script>

<Chart.Root
	id="t"
	{data}
	x="day"
	y="visits"
	xLabel="Day"
	xScale={{ type: scaleTime }}
	xFormat={{ timeZone: 'UTC', dateStyle: 'medium' }}
	locale="en-US"
	width={400}
	height={100}
	margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
	style="width: 400px"
>
	<Chart.Plot>
		<Chart.Rule axis="x" {value} label="Launch" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.DataTable />
</Chart.Root>
