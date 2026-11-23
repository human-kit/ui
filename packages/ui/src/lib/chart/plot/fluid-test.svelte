<script lang="ts">
	import * as Chart from '../index.parts.js';

	const data = [
		{ x: 1, y: 10 },
		{ x: 2, y: 20 }
	];
</script>

<div style="width: 320px">
	<Chart.Root id="f" {data} x="x" y="y" aria-label="Fluid" style="margin: 0">
		<Chart.Plot data-testid="plot">
			<Chart.Line />
		</Chart.Plot>
	</Chart.Root>
</div>
