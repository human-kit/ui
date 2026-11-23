<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';

	type Revenue = { day: Date; revenue: number };
	const data: Revenue[] = [4200, 3900, 5100, 4800, 6100, 7300, 6900].map((revenue, i) => ({
		day: new Date(2025, 2, 3 + i),
		revenue
	}));
</script>

<Chart.Root
	{data}
	x="day"
	y="revenue"
	xScale={{ type: scaleTime }}
	locale="de-DE"
	xFormat={{ weekday: 'short', day: 'numeric', month: 'numeric' }}
	yFormat={{ style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }}
	height={240}
	class="demo-chart"
>
	<Chart.Title>Umsatz pro Tag</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
