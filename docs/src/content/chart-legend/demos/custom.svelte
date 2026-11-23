<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';

	type Build = { day: Date; branch: string; minutes: number };
	const branches: Record<string, number[]> = {
		main: [6.1, 6.4, 5.9, 6.8, 7.2, 6.5, 6.2],
		release: [8.4, 8.1, 8.9, 9.3, 8.7, 8.2, 8.0]
	};
	const data: Build[] = Object.entries(branches).flatMap(([branch, values]) =>
		values.map((minutes, i) => ({ day: new Date(2025, 8, 1 + i), branch, minutes }))
	);
	const latest = (branch: string) => branches[branch].at(-1);
</script>

<Chart.Root
	{data}
	x="day"
	y="minutes"
	series="branch"
	xScale={{ type: scaleTime }}
	height={240}
	class="demo-chart"
>
	<Chart.Title>Build time per day, in minutes</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Legend>
		{#snippet children({ name, index })}
			<span data-swatch=""></span>
			<span class="font-mono">{name}</span>
			<span class="text-muted-foreground">(series {index + 1}, last {latest(name)} min)</span>
		{/snippet}
	</Chart.Legend>
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
