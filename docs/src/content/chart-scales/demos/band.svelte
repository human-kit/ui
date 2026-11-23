<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleBand } from '@human-kit/ui/chart/scales/band';

	type Vote = { option: string; votes: number };
	const data: Vote[] = [
		{ option: 'Red', votes: 12 },
		{ option: 'Green', votes: 19 },
		{ option: 'Blue', votes: 27 },
		{ option: 'Gray', votes: 8 }
	];

	let padding = $state(0.2);
</script>

<div class="flex w-full flex-col gap-3">
	<label class="flex items-center gap-2 text-sm text-foreground">
		Padding
		<input type="range" min="0" max="0.9" step="0.1" bind:value={padding} />
		<output class="font-mono">{padding.toFixed(1)}</output>
	</label>
	<Chart.Root
		{data}
		x="option"
		y="votes"
		xScale={{ type: scaleBand, padding }}
		height={220}
		class="demo-chart"
	>
		<Chart.Title>Votes per color</Chart.Title>
		<Chart.Plot>
			<Chart.Grid />
			<Chart.Axis position="bottom" />
			<Chart.Axis position="left" />
			<Chart.Bar />
		</Chart.Plot>
		<Chart.Tooltip />
		<Chart.DataTable />
	</Chart.Root>
</div>
