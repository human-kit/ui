<script lang="ts">
	import { Chart } from '../../packages/ui/src/lib/chart/index.js';

	let { data }: { data: { x: number; y: number; s: string }[] } = $props();
</script>

<Chart.Root {data} x="x" y="y" series="s" xLabel="X" yLabel="Y" aria-label="Scatter">
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Dot />
	</Chart.Plot>
	<Chart.Legend />
</Chart.Root>
