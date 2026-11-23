<script lang="ts">
	import { dev } from '../../internal/environment.js';
	import { round } from '../internal/path.js';
	import { isValue } from '../internal/series.js';
	import { useChartContext } from '../root/context.js';
	import type { ChartRuleProps } from '../types.js';

	let { value, axis = 'y', label, compare, class: className = '' }: ChartRuleProps = $props();

	const uid = $props.id();
	const ctx = useChartContext('Chart.Rule');
	const id = `chart-${ctx.instanceId}-rule-${uid}`;
	const vertical = $derived(axis === 'x');
	const n = $derived(vertical ? ctx.toX(value) : ctx.toY(value));
	// The position of the line. A category needs a band scale, and a band scale needs a category. A
	// value out of the range has no position: a sighted user does not see it, thus the description
	// does not give it. The product of the distances to the two ends is negative between them.
	const position = $derived.by(() => {
		const scale = vertical ? ctx.xScale : ctx.yScale;
		const [a, b] = scale.range;
		const p = scale(n);
		return isValue(value) &&
			(typeof value === 'string') === (scale.kind === 'band') &&
			(p - a) * (p - b) < 1
			? round(p)
			: NaN;
	});
	const text = $derived(isNaN(position) ? '' : vertical ? ctx.formatX(n) : ctx.formatY(n));
	const channel = $derived(vertical ? ctx.xLabel : ctx.yLabel);
	// The line goes across the plot: the range of the other axis. The label of a vertical line goes
	// at the top.
	const across = $derived(vertical ? ctx.yScale.range : ctx.xScale.range);
	const top = $derived(Math.min(...across));

	const unregister = ctx.rule({
		id,
		get label() {
			return label;
		},
		get text() {
			return text;
		},
		// A category does not go into the domain: a rule does not add a category.
		extent: () => (isValue(value) && typeof value !== 'string' ? { [axis]: [value] } : {}),
		note: (point) => (text && compare?.(point, value)) || ''
	});
	$effect(() => unregister);

	$effect(() => {
		if (dev && !text) console.warn(`Chart.Rule: "${label}" has no place on the ${axis} scale.`);
	});
</script>

<!--
	A rule is a reference for the values, not a value: it takes no focus, and it is hidden from
	assistive technology. The plot gives its description, and the data table gives its row.
-->
<g class={className} data-rule="" data-axis={axis} aria-hidden="true">
	{#if text}
		<line
			x1={vertical ? position : across[0]}
			x2={vertical ? position : across[1]}
			y1={vertical ? across[0] : position}
			y2={vertical ? across[1] : position}
			stroke="currentColor"
		/>
		<text
			x={vertical ? position : across[1]}
			y={vertical ? top : position}
			dx={vertical ? '0.32em' : undefined}
			dy={vertical ? '0.71em' : '-0.32em'}
			text-anchor={vertical ? undefined : 'end'}
			fill="currentColor">{label}</text
		>
		<desc {id}>{label}, {channel ? `${channel} ${text}` : text}</desc>
	{/if}
</g>
