<script module lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { ClassValue } from '../utils/cn';

	export type OverflowRowState = {
		/** Number of items that don't fit and are hidden. */
		count: number;
		/** Number of items actually rendered (0 when not even one fits). */
		visible: number;
		/** Total number of items. */
		total: number;
	};

	export type OverflowRowProps<T> = {
		/** The full list to render on a single line. */
		items: T[];
		/** Stable key for each item (used for keyed `{#each}` and re-measure). */
		getKey: (item: T, index: number) => string | number;
		/**
		 * Renders a single item. Receives the item and its index.
		 *
		 * In overflow mode the snippet renders twice (visible row + hidden measurement
		 * mirror), so it must be render-pure: any effects it owns run twice, and `id`
		 * attributes inside the mirror copy are stripped to avoid duplicate ids.
		 */
		children: Snippet<[{ item: T; index: number }]>;
		/**
		 * Optional overflow indicator. When provided, the row is constrained to a
		 * single line: items that don't fit are not rendered, and this snippet renders
		 * at the end with how many are hidden (plus `visible`/`total`, so the consumer
		 * can e.g. show a summary when nothing fits). Without `overflow`, every item
		 * renders and wrapping is left to the consumer's styles.
		 */
		overflow?: Snippet<[OverflowRowState]>;
		/**
		 * Horizontal space (px) to keep free inside the measured parent for siblings
		 * such as a search input, so the overflow calc doesn't claim the whole row.
		 * Only used in overflow mode.
		 */
		reserve?: number;
		class?: ClassValue;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'children'>;
</script>

<script lang="ts" generics="T">
	let {
		items,
		getKey,
		children,
		overflow,
		reserve = 0,
		class: className = '',
		style,
		...rest
	}: OverflowRowProps<T> = $props();

	const overflowEnabled = $derived(!!overflow);

	// --- single-line overflow measurement -------------------------------------
	// The visible row hugs its content, so a sibling (e.g. a search input) sits
	// right after the last item with no dead gap. The available width therefore
	// can't come from the row itself — it comes from the parent, minus `reserve`.
	// A hidden mirror measures every item at its natural width; deriving from the
	// mirror (never the visible row) keeps the calc stable and free of feedback.
	let containerEl = $state<HTMLElement>();
	let mirrorEl = $state<HTMLElement>();
	let availableWidth = $state(0);
	let itemWidths = $state<number[]>([]);
	let indicatorWidth = $state(0);
	let gap = $state(0);

	$effect(() => {
		const parent = containerEl?.parentElement;
		if (!overflowEnabled || !parent) return;
		const measure = () => {
			const styles = getComputedStyle(parent);
			const paddingX =
				(parseFloat(styles.paddingLeft) || 0) + (parseFloat(styles.paddingRight) || 0);
			const parentGap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
			// The parent gap sits between the row and the reserved sibling, so it
			// only eats space when something is actually reserved; subtracting it
			// unconditionally would hide an item that fits.
			availableWidth = parent.clientWidth - paddingX - (reserve > 0 ? parentGap + reserve : 0);
		};
		const observer = new ResizeObserver(measure);
		observer.observe(parent);
		measure();
		return () => observer.disconnect();
	});

	$effect(() => {
		const mirror = mirrorEl;
		if (!overflowEnabled || !mirror) return;
		// Re-measure whenever the items change.
		void items;
		const measure = () => {
			// The mirror duplicates the consumer snippet: strip any `id` so label/aria
			// associations keep resolving to the visible copy (ids don't affect layout).
			for (const node of mirror.querySelectorAll('[id]')) node.removeAttribute('id');
			const nodes = Array.from(mirror.children) as HTMLElement[];
			// Every child but the last is an item; the last is the indicator sample.
			const itemNodes = nodes.slice(0, items.length);
			itemWidths = itemNodes.map((node) => node.getBoundingClientRect().width);
			const indicator = nodes[nodes.length - 1];
			indicatorWidth = items.length > 0 && indicator ? indicator.getBoundingClientRect().width : 0;
			const styles = getComputedStyle(mirror);
			gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
		};
		// Items can resize after mount (webfonts, async content): the mirror hugs its
		// content, so observing it re-measures whenever any item changes size.
		const observer = new ResizeObserver(measure);
		observer.observe(mirror);
		measure();
		return () => observer.disconnect();
	});

	const visibleCount = $derived.by(() => {
		if (!overflowEnabled) return items.length;
		// Until measured, render everything (so the mirror can size the items).
		if (availableWidth <= 0 || itemWidths.length !== items.length) {
			return items.length;
		}
		const totalWidth =
			itemWidths.reduce((sum, width) => sum + width, 0) + gap * Math.max(itemWidths.length - 1, 0);
		if (totalWidth <= availableWidth) return items.length;
		// Doesn't all fit: reserve room for the overflow indicator.
		const usableWidth = availableWidth - indicatorWidth - gap;
		let used = 0;
		let count = 0;
		for (const width of itemWidths) {
			const next = used + width + (count > 0 ? gap : 0);
			if (next > usableWidth) break;
			used = next;
			count++;
		}
		return count;
	});

	const visibleItems = $derived(overflowEnabled ? items.slice(0, visibleCount) : items);
	const hiddenCount = $derived(items.length - visibleItems.length);

	// The consumer's inline `style` must also apply to the mirror: gaps, fonts or
	// paddings set inline change the measured widths just like classes do.
	const mirrorStyle = $derived(
		`${style ? `${style}; ` : ''}width: max-content; max-width: none; flex-wrap: nowrap;`
	);
</script>

{#if items.length > 0}
	<div
		bind:this={containerEl}
		class={className}
		{style}
		style:flex-wrap={overflowEnabled ? 'nowrap' : null}
		style:overflow-x={overflowEnabled ? 'clip' : null}
		{...rest}
	>
		{#each visibleItems as item, index (getKey(item, index))}
			{@render children({ item, index })}
		{/each}

		{#if overflowEnabled && hiddenCount > 0}
			{@render overflow?.({
				count: hiddenCount,
				visible: visibleItems.length,
				total: items.length
			})}
		{/if}
	</div>

	{#if overflowEnabled}
		<!--
			Measurement mirror: renders every item (and an indicator sample) at natural
			width, off the layout/a11y/tab flow, purely to size the visible row above.
			The zero-size overflow:hidden wrapper keeps the max-content mirror from
			growing the page's scrollable area.
		-->
		<div
			style="position: absolute; top: 0; left: 0; width: 0; height: 0; overflow: hidden; visibility: hidden; pointer-events: none;"
			aria-hidden="true"
			inert
		>
			<div bind:this={mirrorEl} class={className} style={mirrorStyle}>
				{#each items as item, index (getKey(item, index))}
					{@render children({ item, index })}
				{/each}
				{@render overflow?.({ count: items.length, visible: items.length, total: items.length })}
			</div>
		</div>
	{/if}
{/if}
