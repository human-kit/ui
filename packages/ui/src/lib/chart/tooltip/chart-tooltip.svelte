<script lang="ts">
	import { untrack } from 'svelte';
	import { useChartContext } from '../root/context.js';
	import type { ChartTooltipProps } from '../types.js';

	let {
		children,
		offset = 8,
		follow = false,
		class: className = '',
		...restProps
	}: ChartTooltipProps = $props();

	const ctx = useChartContext('Chart.Tooltip');

	let hoveredId: string | null = $state(null);
	// Where the pointer is in the plot, for a tooltip that follows it.
	let pointer: [number, number] | null = $state(null);
	// Escape closes the tooltip until the user moves to another point.
	let dismissed = $state(false);

	// The tooltip shows the point under the pointer, or the point that has the keyboard focus.
	const id = $derived(dismissed ? null : (hoveredId ?? (ctx.focus.visible ? ctx.focus.id : null)));

	const tip = $derived.by(() => {
		const found = ctx.locate(id);
		if (!found) return null;
		const { entry, index } = found;
		const point = entry.points[index];
		const anchor = ctx.anchor(entry.mark, entry.series, index);
		if (!anchor) return null;
		// A tooltip that follows the pointer goes along with it, at the height of the point under it.
		// The point that has the keyboard focus has no pointer, thus its tooltip stays at the point.
		const x = follow && pointer && id === hoveredId ? pointer[0] : anchor[0];
		const y = anchor[1];
		return {
			point,
			x,
			y,
			xText: ctx.formatX(ctx.toX(point.x)),
			yText: ctx.formatY(ctx.toY(point.y)),
			horizontal: entry.horizontal
		};
	});

	// A move of the focus to another point opens the tooltip again.
	$effect(() => {
		void ctx.focus.id;
		untrack(() => (dismissed = false));
	});

	$effect(() => {
		const plot = ctx.plotElement;
		if (!plot) return;
		const onPointerMove = (event: PointerEvent) => {
			const next = ctx.nearest(event.clientX, event.clientY);
			if (next !== hoveredId) dismissed = false;
			hoveredId = next;
			const box = plot.getBoundingClientRect();
			pointer = [event.clientX - box.left, event.clientY - box.top];
		};
		// A finger leaves the plot when it lifts. The tooltip of a tap stays until the next tap.
		const onPointerLeave = (event: PointerEvent) => {
			if (event.pointerType !== 'touch') hoveredId = null;
		};
		// A finger that scrolls the page cancels its pointer: that is not a tap.
		const onPointerCancel = () => (hoveredId = null);
		// A tap out of the plot closes the tooltip of a tap.
		const onOutside = (event: PointerEvent) => {
			if (!plot.contains(event.target as Node)) hoveredId = null;
		};
		const onKeyDown = (event: KeyboardEvent) => {
			// Only a visible tooltip uses the key; otherwise a dialog around the chart gets it.
			if (event.key !== 'Escape' || !tip) return;
			event.preventDefault();
			dismissed = true;
			hoveredId = null;
		};
		plot.addEventListener('pointermove', onPointerMove);
		plot.addEventListener('pointerdown', onPointerMove);
		plot.addEventListener('pointerleave', onPointerLeave);
		plot.addEventListener('pointercancel', onPointerCancel);
		plot.addEventListener('keydown', onKeyDown);
		document.addEventListener('pointerdown', onOutside);
		return () => {
			document.removeEventListener('pointerdown', onOutside);
			plot.removeEventListener('pointerdown', onPointerMove);
			plot.removeEventListener('pointermove', onPointerMove);
			plot.removeEventListener('pointerleave', onPointerLeave);
			plot.removeEventListener('pointercancel', onPointerCancel);
			plot.removeEventListener('keydown', onKeyDown);
		};
	});

	// The figure is the containing block of the tooltip, thus the position adds the distance from
	// the padding edge of the figure to the plot. The tooltip shows only in a browser.
	// `bounds` is the space the tooltip stays in, from the padding edge of the figure: the width of
	// the figure, or for a tooltip that follows the pointer —which must go wherever the pointer goes
	// on a figure narrower than itself— the width of the box that would cut it.
	const placement = $derived.by(() => {
		const plot = ctx.plotElement;
		const figure = plot?.closest('figure');
		if (!tip || !plot || !figure) return { offset: [0, 0], bounds: [0, 0] };
		const a = plot.getBoundingClientRect();
		const b = figure.getBoundingClientRect();
		const start = b.left + figure.clientLeft;
		return {
			offset: [a.left - start, a.top - b.top - figure.clientTop],
			bounds: follow ? clipBounds(figure).map((x) => x - start) : [0, figure.clientWidth]
		};
	});

	/**
	 * The left and the right of the nearest ancestor that cuts what overflows it, on the screen,
	 * or of the page without one.
	 */
	function clipBounds(figure: Element): [number, number] {
		for (let node = figure.parentElement; node; node = node.parentElement) {
			if (getComputedStyle(node).overflowX === 'visible') continue;
			const box = node.getBoundingClientRect();
			return [box.left + node.clientLeft, box.left + node.clientLeft + node.clientWidth];
		}
		return [0, document.documentElement.clientWidth];
	}

	// Near an edge of its bounds, the tooltip moves away from the point. Thus it does not make the
	// page wider on a narrow screen.
	let width = $state(0);
	const left = $derived.by(() => {
		const center = placement.offset[0] + (tip?.x ?? 0);
		const half = width / 2;
		const [min, max] = placement.bounds;
		return Math.max(min + half, Math.min(center, max - half));
	});

	/** The animations that CSS gives the tooltip, or none in a browser without the API. */
	function animationsOf(node: HTMLElement): Animation[] {
		return typeof node.getAnimations === 'function' ? node.getAnimations() : [];
	}

	/**
	 * `data-entering` while the tooltip opens, thus CSS can animate it in. The attribute goes when
	 * the animations that it starts end.
	 */
	function entering(node: HTMLElement) {
		node.setAttribute('data-entering', '');
		Promise.all(animationsOf(node).map((animation) => animation.finished))
			.catch(() => undefined)
			.then(() => node.removeAttribute('data-entering'));
	}

	/**
	 * `data-exiting` while the tooltip closes. It stays for as long as the animations that the
	 * attribute starts, thus CSS can animate it out. Without an animation it goes at once.
	 */
	function exiting(node: HTMLElement) {
		node.removeAttribute('data-entering');
		node.setAttribute('data-exiting', '');
		const ends = animationsOf(node).map((animation) => {
			const end = animation.effect?.getComputedTiming().endTime;
			return typeof end === 'number' ? end : 0;
		});
		return { duration: Math.max(0, ...ends) };
	}
</script>

<!--
	The screen reader reads the name of the focused point, thus the tooltip does not say it again.
	The tooltip never takes the focus and never contains a control.
-->
{#if tip}
	<div
		class={className}
		{@attach entering}
		out:exiting
		aria-hidden="true"
		data-tooltip=""
		data-series={tip.point.series || undefined}
		style:position="absolute"
		bind:offsetWidth={width}
		style:left="{left}px"
		style:top="{placement.offset[1] + tip.y - offset}px"
		style:translate="-50% -100%"
		style:pointer-events="none"
		{...restProps}
	>
		{#if children}
			{@render children(tip)}
		{:else}
			{@const xText = ctx.xLabel ? `${ctx.xLabel} ${tip.xText}` : tip.xText}
			{@const yText = ctx.yLabel ? `${ctx.yLabel} ${tip.yText}` : tip.yText}
			<!-- The category or the x value first, then the series and the value. -->
			<div data-tooltip-key="">{tip.horizontal ? yText : xText}</div>
			<div data-tooltip-value="">
				{#if tip.point.series}<span data-tooltip-series="">{tip.point.series}</span>{/if}
				{tip.horizontal ? xText : yText}
			</div>
		{/if}
	</div>
{/if}
