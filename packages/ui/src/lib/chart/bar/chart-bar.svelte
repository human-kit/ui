<script lang="ts" generics="T">
	import { untrack } from 'svelte';
	import type { Channel } from '../internal/channel.js';
	import { dev } from '../../internal/environment.js';
	import { round } from '../internal/path.js';
	import { groupRows, stackKey } from '../internal/series.js';
	import { stack } from '../internal/stack.js';
	import {
		useChartContext,
		type ChartPoint,
		type ChartSeries,
		type ChartValue
	} from '../root/context.js';
	import type { ChartBarProps } from '../types.js';

	let {
		data,
		x,
		y,
		series,
		key,
		name,
		layout = 'grouped',
		groupPadding = 0.1,
		radius = 0,
		labels = false,
		class: className = ''
	}: ChartBarProps<T> = $props();

	const ctx = useChartContext('Chart.Bar');

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

	// Categories on the y axis make horizontal bars: the bars grow along x. The data decides, not
	// the scale, thus the server knows it before the scales exist.
	const horizontal = $derived(typeof groups[0]?.points[0]?.y === 'string');
	const category = (p: ChartPoint<T>) => (horizontal ? p.y : p.x);
	const value = (p: ChartPoint<T>) => +(horizontal ? p.x : p.y);

	// The start and the end of each bar, in data values.
	const spans = $derived(
		layout === 'stacked'
			? stack(
					groups.map((s) => s.points.map((p) => ({ key: stackKey(category(p)), y: value(p) }))),
					!horizontal
				)
			: groups.map((s) => s.points.map((p): [number, number] => [0, value(p)]))
	);

	// The domains must include the ends of a stack, and the data of a mark with its own data.
	const own = untrack(() => data !== undefined || x !== undefined || y !== undefined);
	const registration = ctx.register({
		read: () => groups as ChartSeries[],
		extent() {
			const categories = own ? groups.flatMap((s) => s.points.map(category)) : undefined;
			const values = layout === 'stacked' || own ? spans.flat(2) : undefined;
			return horizontal ? { x: values, y: categories } : { x: categories, y: values };
		},
		// The tooltip points at the middle of the end of the bar.
		anchor(si, i) {
			const box = rect(si, i, groups[si].points[i]);
			const positive = value(groups[si].points[i]) >= 0;
			return horizontal
				? [positive ? box.x + box.width : box.x, box.y + box.height / 2]
				: [box.x + box.width / 2, positive ? box.y : box.y + box.height];
		},
		// The distance to the edge of the bar: 0 in the bar.
		distance(si, i, px, py) {
			const box = rect(si, i, groups[si].points[i]);
			const dx = Math.max(box.x - px, 0, px - box.x - box.width);
			const dy = Math.max(box.y - py, 0, py - box.y - box.height);
			return dx * dx + dy * dy;
		},
		horizontal: () => horizontal
	});
	$effect(() => registration.unregister);

	const bandScale = $derived(horizontal ? ctx.yScale : ctx.xScale);
	const valueScale = $derived(horizontal ? ctx.xScale : ctx.yScale);

	$effect(() => {
		if (dev && groups.length && bandScale.bandwidth === 0) {
			const axis = horizontal ? 'y' : 'x';
			console.warn(
				`Chart.Bar: the ${axis} scale has no bands. Import \`scaleBand\` from "@human-kit/ui/chart/scales/band" and give \`${axis}Scale={{ type: scaleBand }}\`.`
			);
		}
	});

	// The rounded end and the value label are for the end of a bar. In a stack, only the last bar
	// has that end, thus a stack keeps square bars and no labels.
	const ends = $derived(layout === 'grouped');
	const rounded = $derived(ends && radius > 0);

	/** The text of the label of a point, or an empty string for no label. */
	function labelText(p: ChartPoint<T>) {
		if (!ends || !labels) return '';
		if (typeof labels === 'function') return labels(p);
		return horizontal ? ctx.formatX(value(p)) : ctx.formatY(value(p));
	}

	// The labels go after the end of the bar, out of the bar: the text keeps the color of the
	// text, and a short bar does not cut it.
	const LABEL_GAP = 4;
	let labelsGroup: SVGGElement | null = $state(null);
	// The width of each label, from the last measure. Until then, a label goes out of its bar.
	let labelWidths = $state<Record<string, number>>({});

	/**
	 * The place of the label of a horizontal bar. A label goes after the end of its bar. The label
	 * of a negative bar goes on the other side of zero when there is no room before the bar.
	 */
	function horizontalLabel(box: Box, negative: boolean, key: string) {
		if (!negative) return { x: box.x + box.width + LABEL_GAP, anchor: 'start' };
		const room = box.x - Math.min(...valueScale.range);
		if (room >= (labelWidths[key] ?? 0) + LABEL_GAP) {
			return { x: box.x - LABEL_GAP, anchor: 'end' };
		}
		return { x: box.x + box.width + LABEL_GAP, anchor: 'start' };
	}

	function labelPlace(si: number, i: number, p: ChartPoint<T>) {
		const box = rect(si, i, p);
		const negative = value(p) < 0;
		if (horizontal) {
			const { x, anchor } = horizontalLabel(box, negative, `${si}-${i}`);
			return { x, y: box.y + box.height / 2, dy: '0.32em', 'text-anchor': anchor };
		}
		return negative
			? {
					x: box.x + box.width / 2,
					y: box.y + box.height + LABEL_GAP,
					dy: '0.71em',
					'text-anchor': 'middle'
				}
			: { x: box.x + box.width / 2, y: box.y - LABEL_GAP, dy: '0', 'text-anchor': 'middle' };
	}

	// The labels ask for the space that they need after the plot, as an axis does for its ticks.
	const reservation = untrack(() =>
		labels ? ctx.reserve(horizontal ? { right: 48 } : { top: 16 }) : null
	);
	$effect(() => () => reservation?.unregister());

	$effect(() => {
		// Measure again after each change of the bars and of the scales.
		void [groups, spans, ctx.xScale, ctx.yScale];
		if (!labelsGroup || !reservation) return;
		const widths: Record<string, number> = {};
		for (const text of labelsGroup.querySelectorAll<SVGTextElement>('text')) {
			widths[text.dataset.key ?? ''] = text.getComputedTextLength();
		}
		if (Object.entries(widths).some(([key, w]) => Math.abs((labelWidths[key] ?? -1) - w) >= 1)) {
			labelWidths = widths;
		}
		const box = labelsGroup.getBBox();
		const [x0, x1] = [Math.min(...ctx.xScale.range), Math.max(...ctx.xScale.range)];
		const [y0, y1] = [Math.min(...ctx.yScale.range), Math.max(...ctx.yScale.range)];
		reservation.update({
			left: Math.max(0, x0 - box.x),
			right: Math.max(0, box.x + box.width - x1),
			top: Math.max(0, y0 - box.y),
			bottom: Math.max(0, box.y + box.height - y1)
		});
	});

	/** The value on the value scale nearest to `v`: a bar does not go out of the plot. */
	function clamp(v: number) {
		const [a, b] = valueScale.domain;
		return Math.min(Math.max(v, Math.min(a, b)), Math.max(a, b));
	}

	type Box = { x: number; y: number; width: number; height: number };

	/**
	 * The outline of a bar with round corners at its end: at the right of a positive horizontal
	 * bar, at the top of a positive vertical bar. The corners at zero stay square, thus the bar
	 * stands on its baseline. The radius is not more than half of the width of the bar.
	 */
	function barPath({ x, y, width: w, height: h }: Box, p: ChartPoint<T>) {
		const negative = value(p) < 0;
		const r = round(Math.min(radius, horizontal ? h / 2 : w / 2, horizontal ? w : h));
		if (r <= 0) return `M${x},${y}h${w}v${h}h${-w}Z`;
		const arc = (sweep: number, dx: number, dy: number) => `a${r},${r} 0 0 ${sweep} ${dx},${dy}`;
		if (horizontal && !negative) {
			return `M${x},${y}h${w - r}${arc(1, r, r)}v${h - 2 * r}${arc(1, -r, r)}h${r - w}Z`;
		}
		if (horizontal) {
			return `M${x + w},${y}h${r - w}${arc(0, -r, r)}v${h - 2 * r}${arc(0, r, r)}h${w - r}Z`;
		}
		if (!negative) {
			return `M${x},${y + h}v${r - h}${arc(1, r, -r)}h${w - 2 * r}${arc(1, r, r)}v${h - r}Z`;
		}
		return `M${x},${y}v${h - r}${arc(0, r, r)}h${w - 2 * r}${arc(0, r, -r)}v${r - h}Z`;
	}

	function rect(si: number, i: number, p: ChartPoint<T>): Box {
		const band = bandScale.bandwidth;
		const center = bandScale(horizontal ? ctx.toY(p.y) : ctx.toX(p.x));
		let start = center - band / 2;
		let size = band;
		if (layout === 'grouped' && groups.length > 1) {
			const slot = band / groups.length;
			size = slot * (1 - groupPadding);
			start += si * slot + (slot - size) / 2;
		}
		const [from, to] = spans[si][i];
		const a = valueScale(clamp(from));
		const b = valueScale(clamp(to));
		const across = { start: round(start), size: round(Math.max(0, size)) };
		const along = { start: round(Math.min(a, b)), size: round(Math.abs(b - a)) };
		return horizontal
			? { x: along.start, y: across.start, width: along.size, height: across.size }
			: { x: across.start, y: along.start, width: across.size, height: along.size };
	}
</script>

<g
	class={className}
	data-mark="bar"
	data-layout={layout}
	data-orientation={horizontal ? 'horizontal' : 'vertical'}
>
	{#each groups as s, si (s.name)}
		<g role="group" aria-label={s.name || undefined} data-series={s.name || undefined}>
			{#each s.points as p, i (p.key)}
				{#if rounded}
					<path
						d={barPath(rect(si, i, p), p)}
						fill="currentColor"
						data-point=""
						data-bar=""
						data-negative={value(p) < 0 ? 'true' : undefined}
						{...ctx.point(registration.id, si, i, p as ChartPoint)}
					/>
				{:else}
					<rect
						{...rect(si, i, p)}
						fill="currentColor"
						data-point=""
						data-bar=""
						data-negative={value(p) < 0 ? 'true' : undefined}
						{...ctx.point(registration.id, si, i, p as ChartPoint)}
					/>
				{/if}
			{/each}
		</g>
	{/each}
	{#if ends && labels}
		<!-- The names of the bars already say their values: the labels are for the eye only. -->
		<g bind:this={labelsGroup} aria-hidden="true" data-bar-labels="" fill="currentColor">
			{#each groups as s, si (s.name)}
				{#each s.points as p, i (i)}
					{@const text = labelText(p)}
					{#if text}
						<text {...labelPlace(si, i, p)} data-key="{si}-{i}" data-bar-label="">{text}</text>
					{/if}
				{/each}
			{/each}
		</g>
	{/if}
</g>
