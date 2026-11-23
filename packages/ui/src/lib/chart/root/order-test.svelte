<script lang="ts">
	import * as Chart from '../index.parts.js';

	type Row = { t: number; v: number; s: string };

	const data: Row[] = [
		{ t: 1, v: 1, s: 'A' },
		{ t: 2, v: 2, s: 'A' },
		{ t: 1, v: 3, s: 'B' },
		{ t: 2, v: 4, s: 'B' }
	];
</script>

<Chart.Root {data} x="t" y="v" series="s" width={300} height={200} margin={{}}>
	<Chart.Title>Order</Chart.Title>
	<Chart.Plot>
		<Chart.Area />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Legend />
</Chart.Root>
