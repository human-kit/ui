<script lang="ts" generics="T">
	import { arcPath, inArc, polar } from '../internal/arc.js';
	import { read, type Channel } from '../internal/channel.js';
	import { dev } from '../../internal/environment.js';
	import { round } from '../internal/path.js';
	import { groupRows } from '../internal/series.js';
	import {
		useChartContext,
		type ChartPoint,
		type ChartSeries,
		type ChartValue
	} from '../root/context.js';
	import type { ChartArcProps } from '../types.js';

	let {
		data,
		x,
		y,
		series,
		key,
		name,
		inner = 0,
		labels = false,
		class: className = ''
	}: ChartArcProps<T> = $props();

	const ctx = useChartContext('Chart.Arc');

	// One series, in the order of the data. A negative value has no angle, thus it is not a slice.
	const groups = $derived.by(() => {
		const out = groupRows(
			(data ?? ctx.data) as readonly T[],
			(x ?? ctx.x) as Channel<T, ChartValue> | undefined,
			(y ?? ctx.y) as Channel<T, ChartValue> | undefined,
			(series ?? ctx.series) as Channel<T, string> | undefined,
			name,
			(key ?? ctx.key) as Channel<T, ChartValue> | undefined
		).slice(0, 1);
		for (const s of out) s.points = s.points.filter((p) => +p.y >= 0);
		return out;
	});

	$effect(() => {
		const rows = (data ?? ctx.data) as readonly T[];
		const channel = (y ?? ctx.y) as Channel<T, ChartValue> | undefined;
		if (dev && channel && rows.some((row, i) => Number(read(channel, row, i)) < 0)) {
			console.warn('Chart.Arc: a negative value has no slice.');
		}
	});

	const percent = $derived(
		new Intl.NumberFormat(ctx.locale, { style: 'percent', maximumFractionDigits: 1 })
	);
	const total = $derived(groups[0]?.points.reduce((sum, p) => sum + +p.y, 0) ?? 0);

	// The start and the end angle of each slice. The first slice starts at the top, and the slices
	// go clockwise. When the total is 0, all of the slices have no angle.
	const angles = $derived.by(() => {
		let start = 0;
		return (groups[0]?.points ?? []).map((p): [number, number] => {
			const end = total ? start + (+p.y / total) * 2 * Math.PI : 0;
			const out: [number, number] = [start, end];
			start = end;
			return out;
		});
	});

	// The circle is in the middle of the plot, and it fills its smaller side.
	const m = $derived(ctx.margin);
	const cx = $derived((m.left + ctx.width - m.right) / 2);
	const cy = $derived((m.top + ctx.height - m.bottom) / 2);
	const r1 = $derived(
		Math.max(0, Math.min(ctx.width - m.left - m.right, ctx.height - m.top - m.bottom) / 2)
	);
	const r0 = $derived(r1 * Math.min(Math.max(inner, 0), 1));
	// The radius of the middle of a slice: the tooltip points there, and a label goes there.
	const mid = $derived(r0 ? (r0 + r1) / 2 : r1 * 0.6);

	function middle(i: number): [number, number] {
		const [a0, a1] = angles[i];
		const [px, py] = polar(mid, (a0 + a1) / 2);
		return [cx + px, cy + py];
	}

	const registration = ctx.register({
		read: () => groups as ChartSeries[],
		anchor: (_, i) => middle(i),
		// A position in the slice has the distance 0. The hole and the space out of the circle
		// are far from each slice, thus they open no tooltip.
		distance: (_, i, px, py) =>
			inArc(r0, r1, angles[i][0], angles[i][1], px - cx, py - cy) ? 0 : Infinity,
		share: (p) => (total ? percent.format(+p.y / total) : '')
	});
	$effect(() => registration.unregister);

	/** The text of the label of a point. */
	function labelText(p: ChartPoint<T>) {
		return typeof labels === 'function' ? labels(p) : ctx.formatY(ctx.toY(p.y));
	}

	let labelsGroup: SVGGElement | null = $state(null);
	// The size of each label, from the last measure. Until then, all of the labels show.
	let sizes = $state<[number, number][]>([]);
	$effect(() => {
		void [groups, labels];
		if (!labelsGroup) return;
		const next = [...labelsGroup.querySelectorAll<SVGTextElement>('text')].map(
			(text): [number, number] => {
				const box = text.getBBox();
				return [box.width, box.height];
			}
		);
		if (next.some((size, i) => size[0] !== sizes[i]?.[0] || size[1] !== sizes[i]?.[1])) {
			sizes = next;
		}
	});

	/**
	 * Whether a label fits in its slice: its width in the chord at the middle radius, and its
	 * height in the width of the ring.
	 */
	function fits(i: number) {
		const size = sizes[i];
		if (!size) return true;
		const chord = 2 * mid * Math.sin(Math.min(angles[i][1] - angles[i][0], Math.PI) / 2);
		return size[0] + 4 <= chord && size[1] <= r1 - r0;
	}
</script>

<g class={className} data-mark="arc" transform="translate({round(cx)},{round(cy)})">
	{#each groups as s, si (s.name)}
		<g role="group" aria-label={s.name || undefined} data-series={s.name || undefined}>
			{#each s.points as p, i (p.key)}
				<path
					d={arcPath(r0, r1, angles[i][0], angles[i][1])}
					fill="currentColor"
					data-point=""
					data-category={String(p.x)}
					{...ctx.point(registration.id, si, i, p as ChartPoint)}
				/>
			{/each}
		</g>
	{/each}
	{#if labels}
		<!-- The names of the slices already say their values: the labels are for the eye only. -->
		<g bind:this={labelsGroup} aria-hidden="true" data-arc-labels="" text-anchor="middle">
			{#each groups[0]?.points ?? [] as p, i (i)}
				{@const [lx, ly] = polar(mid, (angles[i][0] + angles[i][1]) / 2)}
				<text
					x={lx}
					y={ly}
					dy="0.32em"
					data-category={String(p.x)}
					data-arc-label=""
					visibility={fits(i) ? undefined : 'hidden'}>{labelText(p)}</text
				>
			{/each}
		</g>
	{/if}
</g>
