<script lang="ts">
	import { Chart } from '../../packages/ui/src/lib/chart/index.js';

	let { data }: { data: { x: number; y: number }[] } = $props();
</script>

<Chart.Root {data} x="x" y="y" aria-label="Line">
	<Chart.Plot>
		<Chart.Line />
	</Chart.Plot>
</Chart.Root>
