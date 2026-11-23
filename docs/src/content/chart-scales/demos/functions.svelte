<script lang="ts">
	import { scaleLinear } from '@human-kit/ui/chart/scales/linear';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';
	import { scaleBand } from '@human-kit/ui/chart/scales/band';

	// A scale is a function: a value in, a position in pixels out.
	const linear = scaleLinear([0, 97], [0, 300]);
	const nice = scaleLinear(linear.nice(5), [0, 300]);

	const time = scaleTime([+new Date(2025, 0, 1), +new Date(2025, 11, 31)], [0, 300]);

	const band = scaleBand([0, 0], [0, 300], { categories: ['A', 'B', 'C'], padding: 0.2 });

	const rows = [
		['linear(48.5)', linear(48.5).toFixed(1)],
		['linear.nice(5)', nice.domain.join(' to ')],
		['nice.ticks(5)', nice.ticks(5).join(', ')],
		['time.ticks(4)', time.ticks(4).map(time.tickFormat(4, 'en')).join(', ')],
		['band(1)', String(band(1))],
		['band.bandwidth', String(band.bandwidth)]
	];
</script>

<table class="w-full max-w-md text-sm">
	<thead>
		<tr>
			<th class="py-1 text-left font-medium text-foreground">Call</th>
			<th class="py-1 text-left font-medium text-foreground">Result</th>
		</tr>
	</thead>
	<tbody>
		{#each rows as [call, result] (call)}
			<tr class="border-t">
				<td class="py-1 pr-4 font-mono text-muted-foreground">{call}</td>
				<td class="py-1 font-mono text-foreground">{result}</td>
			</tr>
		{/each}
	</tbody>
</table>
