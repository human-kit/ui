<script module lang="ts">
	export type OverflowRowState = {
		/** Number of items that don't fit and are hidden. */
		count: number;
		/** Number of items actually rendered (0 when not even one fits). */
		visible: number;
		/** Total number of items. */
		total: number;
	};
</script>

<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { cn } from '../utils/cn.js';

	type Props = {
		/** The full list to render on a single line. */
		items: T[];
		/** Stable key for each item (used for keyed `{#each}` and re-measure). */
		getKey: (item: T, index: number) => string | number;
		/** Renders a single item. Receives the item and its index. */
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
		class?: string;
	} & Omit<HTMLAttributes<HTMLDivElement>, 'class' | 'children'>;

	let {
		items,
		getKey,
		children,
		overflow,
		reserve = 0,
		class: className = '',
		...rest
	}: Props = $props();

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
			availableWidth = parent.clientWidth - paddingX - parentGap - reserve;
		};
		const observer = new ResizeObserver(measure);
		observer.observe(parent);
		measure();
		return () => observer.disconnect();
	});

	$effect(() => {
		if (!overflowEnabled || !mirrorEl) return;
		// Re-measure whenever the items change.
		void items;
		const nodes = Array.from(mirrorEl.children) as HTMLElement[];
		// Every child but the last is an item; the last is the indicator sample.
		const itemNodes = nodes.slice(0, items.length);
		itemWidths = itemNodes.map((node) => node.getBoundingClientRect().width);
		const indicator = nodes[nodes.length - 1];
		indicatorWidth = items.length > 0 && indicator ? indicator.getBoundingClientRect().width : 0;
		const styles = getComputedStyle(mirrorEl);
		gap = parseFloat(styles.columnGap || styles.gap || '0') || 0;
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
</script>

{#if items.length > 0}
	<div
		bind:this={containerEl}
		class={cn(className, overflowEnabled && 'flex-nowrap overflow-x-clip')}
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
		-->
		<div
			bind:this={mirrorEl}
			class={cn(className, 'pointer-events-none invisible absolute top-0 left-0 flex-nowrap')}
			style="width: max-content; max-width: none;"
			aria-hidden="true"
			inert
		>
			{#each items as item, index (getKey(item, index))}
				{@render children({ item, index })}
			{/each}
			{@render overflow?.({ count: items.length, visible: items.length, total: items.length })}
		</div>
	{/if}
{/if}
