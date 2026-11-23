<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import type { Channel } from '../internal/channel.js';
	import { round } from '../internal/path.js';
	import { groupRows } from '../internal/series.js';
	import { SYMBOLS, symbolPath } from '../internal/symbol.js';
	import {
		useChartContext,
		type ChartPoint,
		type ChartSeries,
		type ChartValue
	} from '../root/context.js';
	import type { ChartDotProps } from '../types.js';

	let {
		data,
		x,
		y,
		series,
		key,
		name,
		r = 4,
		symbol = 'auto',
		class: className = ''
	}: ChartDotProps<T> = $props();

	const ctx = useChartContext('Chart.Dot');

	// The dots of a series in the order of x, then of y. The keyboard, the DOM and the data table
	// all use this order, thus a user can predict the next dot.
	const groups = $derived.by(() => {
		const out = groupRows(
			(data ?? ctx.data) as readonly T[],
			(x ?? ctx.x) as Channel<T, ChartValue> | undefined,
			(y ?? ctx.y) as Channel<T, ChartValue> | undefined,
			(series ?? ctx.series) as Channel<T, string> | undefined,
			name,
			(key ?? ctx.key) as Channel<T, ChartValue> | undefined
		);
		for (const s of out) {
			s.points.sort((a, b) => ctx.toX(a.x) - ctx.toX(b.x) || ctx.toY(a.y) - ctx.toY(b.y));
		}
		return out;
	});

	/** The position of a dot in the plot. */
	const at = (p: ChartPoint<T>): [number, number] => [
		ctx.xScale(ctx.toX(p.x)),
		ctx.yScale(ctx.toY(p.y))
	];

	const shapeOf = (si: number) => (symbol === 'auto' ? SYMBOLS[si % SYMBOLS.length] : symbol);

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
		anchor: (si, i) => at(groups[si].points[i]),
		list: true,
		symbol: (si) => ({ name: shapeOf(si), d: symbolPath(shapeOf(si), 40) })
	});
	$effect(() => registration.unregister);
</script>

<g class={className} data-mark="dot">
	{#each groups as s, si (s.name)}
		{@const shape = shapeOf(si)}
		{@const d = symbolPath(shape, Math.PI * r * r)}
		<g
			role="group"
			aria-label={s.name || undefined}
			data-series={s.name || undefined}
			data-symbol={shape}
		>
			{#each s.points as p, i (p.key)}
				{@const [px, py] = at(p)}
				<path
					{d}
					transform="translate({round(px)},{round(py)})"
					fill="currentColor"
					data-point=""
					{...ctx.point(registration.id, si, i, p as ChartPoint)}
				/>
			{/each}
		</g>
	{/each}
</g>
