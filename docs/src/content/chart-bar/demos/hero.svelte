<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleBand } from '@human-kit/ui/chart/scales/band';

	type Sale = { quarter: string; region: string; sales: number };
	const regions: Record<string, number[]> = {
		North: [24, 31, 28, 36],
		South: [18, 22, 27, 25],
		East: [12, 19, 15, 23]
	};
	const data: Sale[] = Object.entries(regions).flatMap(([region, values]) =>
		values.map((sales, i) => ({ quarter: `Q${i + 1}`, region, sales }))
	);

	let layout: 'grouped' | 'stacked' = $state('grouped');
</script>

<div class="flex w-full flex-col gap-3">
	<label class="flex items-center gap-2 text-sm text-foreground">
		<input
			type="checkbox"
			checked={layout === 'stacked'}
			onchange={(event) => (layout = event.currentTarget.checked ? 'stacked' : 'grouped')}
		/>
		Stacked
	</label>
	<Chart.Root
		{data}
		x="quarter"
		y="sales"
		series="region"
		xScale={{ type: scaleBand }}
		class="demo-chart"
	>
		<Chart.Title>Sales per quarter, in units</Chart.Title>
		<Chart.Plot>
			<Chart.Grid />
			<Chart.Axis position="bottom" />
			<Chart.Axis position="left" />
			<Chart.Bar {layout} />
		</Chart.Plot>
		<Chart.Legend />
		<Chart.Tooltip />
		<Chart.DataTable />
	</Chart.Root>
</div>
