<script lang="ts">
	import { Chart } from '../../packages/ui/src/lib/chart/index.js';
	import { scaleBand } from '../../packages/ui/src/lib/chart/scales/band.js';

	let { data }: { data: { x: string; y: number }[] } = $props();
</script>

<Chart.Root {data} x="x" y="y" xScale={{ type: scaleBand }} aria-label="Bars with a target">
	<Chart.Plot>
		<Chart.Rule value={100} label="Target" />
		<Chart.Bar />
	</Chart.Plot>
	<Chart.DataTable />
</Chart.Root>
