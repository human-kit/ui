<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';

	type Price = { day: Date; price: number };
	const data: Price[] = [
		101.2, 102.8, 101.9, 104.3, 106.1, 105.4, 107.8, 109.2, 108.1, 110.6, 112.4, 111.7
	].map((price, i) => ({ day: new Date(2025, 9, 1 + i), price }));
</script>

<Chart.Root
	{data}
	x="day"
	y="price"
	xScale={{ type: scaleTime }}
	yScale={{ zero: false }}
	yFormat={{ style: 'currency', currency: 'USD' }}
	height={240}
	class="demo-chart"
>
	<Chart.Title>Price of one share</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
