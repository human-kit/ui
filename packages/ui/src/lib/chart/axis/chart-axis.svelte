<script lang="ts">
	import { untrack } from 'svelte';
	import { useChartContext } from '../root/context.js';
	import type { ChartAxisProps } from '../types.js';

	let {
		position = 'bottom',
		label: labelProp,
		tickSize = 6,
		tickPadding = 3,
		class: className = ''
	}: ChartAxisProps = $props();

	const ctx = useChartContext('Chart.Axis');

	const horizontal = $derived(position === 'bottom' || position === 'top');
	// The direction of the ticks: away from the plot.
	const sign = $derived(position === 'bottom' || position === 'right' ? 1 : -1);
	const ticks = $derived(horizontal ? ctx.xTicks : ctx.yTicks);
	// Without a label of its own, the axis shows the label of its channel.
	const label = $derived(labelProp ?? (horizontal ? ctx.xLabel : ctx.yLabel));
	const range = $derived(horizontal ? ctx.xScale.range : ctx.yScale.range);
	const offset = $derived(
		position === 'bottom'
			? ctx.height - ctx.margin.bottom
			: position === 'top'
				? ctx.margin.top
				: position === 'left'
					? ctx.margin.left
					: ctx.width - ctx.margin.right
	);
	const reach = $derived(tickSize + tickPadding);

	// The space for the labels before the first measure: on the server, and at the first frame.
	// The measure replaces it, thus the first values of the props are enough.
	const registration = untrack(() => {
		const estimate = horizontal ? 24 : 40;
		return ctx.reserve({ [position]: label ? estimate + 18 : estimate });
	});
	$effect(() => registration.unregister);

	let group: SVGGElement | null = $state(null);
	let ticksGroup: SVGGElement | null = $state(null);
	// The size of the tick labels across the axis. The axis label goes after it.
	let depth = $state(untrack(() => (horizontal ? 16 : 32)));

	// A web font that loads after the first measure changes the size of the labels.
	let fonts = $state(0);
	$effect(() => {
		const set = document.fonts;
		if (!set) return;
		const remeasure = () => fonts++;
		set.addEventListener('loadingdone', remeasure);
		void set.ready.then(remeasure);
		return () => set.removeEventListener('loadingdone', remeasure);
	});

	$effect(() => {
		// Measure again after each change of the ticks, the label, the position and the fonts.
		void [ticks, label, offset, range, fonts];
		if (!group || !ticksGroup) return;
		const tickBox = ticksGroup.getBBox();
		depth = horizontal ? tickBox.height : tickBox.width;
		const box = group.getBBox();
		// A linear y range runs up and a band y range runs down: use the lower end as the start.
		const [start, end] = [Math.min(range[0], range[1]), Math.max(range[0], range[1])];
		const before = horizontal ? start - box.x : start - box.y;
		const after = horizontal ? box.x + box.width - end : box.y + box.height - end;
		const across =
			sign > 0
				? horizontal
					? box.y + box.height
					: box.x + box.width
				: -(horizontal ? box.y : box.x);
		registration.update(
			horizontal
				? { [position]: across, left: before, right: after }
				: { [position]: across, top: before, bottom: after }
		);
	});

	const labelGap = 6;
</script>

<g
	bind:this={group}
	class={className}
	aria-hidden="true"
	data-axis={position}
	transform={horizontal ? `translate(0,${offset})` : `translate(${offset},0)`}
	fill="currentColor"
>
	<line
		data-axis-line=""
		stroke="currentColor"
		x1={horizontal ? range[0] : 0}
		x2={horizontal ? range[1] : 0}
		y1={horizontal ? 0 : range[0]}
		y2={horizontal ? 0 : range[1]}
	/>
	<g bind:this={ticksGroup}>
		{#each ticks as tick (tick.value)}
			<g
				data-tick=""
				transform={horizontal ? `translate(${tick.position},0)` : `translate(0,${tick.position})`}
			>
				<line
					stroke="currentColor"
					x2={horizontal ? 0 : sign * tickSize}
					y2={horizontal ? sign * tickSize : 0}
				/>
				<text
					x={horizontal ? 0 : sign * reach}
					y={horizontal ? sign * reach : 0}
					dy={position === 'bottom' ? '0.71em' : position === 'top' ? '0' : '0.32em'}
					text-anchor={horizontal ? 'middle' : sign > 0 ? 'start' : 'end'}>{tick.label}</text
				>
			</g>
		{/each}
	</g>
	{#if label}
		{@const middle = (range[0] + range[1]) / 2}
		{@const distance = sign * (reach + depth + labelGap)}
		<text
			data-axis-label=""
			text-anchor="middle"
			dy={sign > 0 ? '0.71em' : '0'}
			transform={horizontal
				? `translate(${middle},${distance})`
				: `translate(${distance},${middle}) rotate(-90)`}>{label}</text
		>
	{/if}
</g>
