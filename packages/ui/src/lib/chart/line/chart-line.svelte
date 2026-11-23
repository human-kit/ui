<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import type { Channel } from '../internal/channel.js';
	import { linePath, round } from '../internal/path.js';
	import { groupRows } from '../internal/series.js';
	import {
		useChartContext,
		type ChartPoint,
		type ChartSeries,
		type ChartValue
	} from '../root/context.js';
	import type { ChartLineProps } from '../types.js';

	let { data, x, y, series, key, name, r = 3, class: className = '' }: ChartLineProps<T> = $props();

	const ctx = useChartContext('Chart.Line');

	const groups = $derived(
		groupRows(
			(data ?? ctx.data) as readonly T[],
			(x ?? ctx.x) as Channel<T, ChartValue> | undefined,
			(y ?? ctx.y) as Channel<T, ChartValue> | undefined,
			(series ?? ctx.series) as Channel<T, string> | undefined,
			name,
			(key ?? ctx.key) as Channel<T, ChartValue> | undefined
		)
	);

	/** The position of a point in the plot. */
	const at = (p: ChartPoint<T>): [number, number] => [
		ctx.xScale(ctx.toX(p.x)),
		ctx.yScale(ctx.toY(p.y))
	];

	// A mark with data or channels of its own adds its values to the domains.
	const own = untrack(() => data !== undefined || x !== undefined || y !== undefined);
	const registration = ctx.register({
		read: () => groups as ChartSeries[],
		extent: own
			? () => ({
					x: groups.flatMap((s) => s.points.map((p) => p.x)),
					y: groups.flatMap((s) => s.points.map((p) => p.y))
				})
			: undefined,
		anchor: (si, i) => at(groups[si].points[i])
	});
	$effect(() => registration.unregister);
</script>

<g class={className} data-mark="line">
	{#each groups as s, si (s.name)}
		<g role="group" aria-label={s.name || undefined} data-series={s.name || undefined}>
			<path
				d={linePath(s.points.map(at), s.breaks)}
				fill="none"
				stroke="currentColor"
				aria-hidden="true"
				data-line=""
			/>
			{#each s.points as p, i (p.key)}
				<circle
					cx={round(at(p)[0])}
					cy={round(at(p)[1])}
					{r}
					fill="currentColor"
					data-point=""
					{...ctx.point(registration.id, si, i, p as ChartPoint)}
				/>
			{/each}
		</g>
	{/each}
</g>
