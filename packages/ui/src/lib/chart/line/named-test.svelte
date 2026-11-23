<script lang="ts">
	import * as Chart from '../index.parts.js';

	const data = [
		{ month: 1, revenue: 66, cost: 40 },
		{ month: 2, revenue: 70, cost: 42 }
	];
</script>

<Chart.Root id="n" {data} x="month" y="revenue" width={400} height={200} aria-label="Sales">
	<Chart.Plot>
		<Chart.Line name="Revenue" />
		<Chart.Line {data} y="cost" name="Cost" />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.DataTable />
</Chart.Root>
