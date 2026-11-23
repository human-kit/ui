<script lang="ts">
	import { Chart } from '@human-kit/ui';

	type Reading = { hour: number; temperature: number };
	const data: Reading[] = [18.2, 18.9, 19.6, 21.4, 22.8, 23.1, 22.4, 21.0].map(
		(temperature, i) => ({
			hour: 8 + i * 2,
			temperature
		})
	);

	let zero = $state(false);
</script>

<div class="flex w-full flex-col gap-3">
	<label class="flex items-center gap-2 text-sm text-foreground">
		<input type="checkbox" bind:checked={zero} />
		Start the y axis at zero
	</label>
	<Chart.Root
		{data}
		x="hour"
		y="temperature"
		yScale={{ zero }}
		xFormat={(hour) => `${hour}:00`}
		yFormat={{ style: 'unit', unit: 'celsius', maximumFractionDigits: 1 }}
		height={240}
		class="demo-chart"
	>
		<Chart.Title>Temperature in the office</Chart.Title>
		<Chart.Plot>
			<Chart.Grid />
			<Chart.Axis position="bottom" />
			<Chart.Axis position="left" />
			<Chart.Line />
		</Chart.Plot>
		<Chart.Tooltip />
		<Chart.DataTable />
	</Chart.Root>
</div>
