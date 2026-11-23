<script lang="ts">
	import { Chart } from '../../packages/ui/src/lib/chart/index.js';
	import { scaleTime } from '../../packages/ui/src/lib/chart/scales/time.js';

	let { data }: { data: { x: Date; y: number }[] } = $props();
</script>

<Chart.Root {data} x="x" y="y" xScale={{ type: scaleTime }} aria-label="Line">
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" label="Value" />
		<Chart.Line />
	</Chart.Plot>
</Chart.Root>
