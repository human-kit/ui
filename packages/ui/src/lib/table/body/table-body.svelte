<script
	lang="ts"
	generics="T extends Record<string, unknown> & { id: string | number } = Record<string, unknown> & { id: string | number }"
>
	import { flushSync, type Snippet } from 'svelte';
	import { setTableSectionContext, useTableContext } from '../root/context.svelte';
	import type { TableBodyProps } from '../types.js';

	let {
		items,
		virtualizer,
		children,
		empty,
		class: className = '',
		...restProps
	}: TableBodyProps<T> = $props();
	setTableSectionContext({ section: 'body' });
	const table = useTableContext();
	let bodyElement = $state<HTMLTableSectionElement | undefined>(undefined);
	let scrollTop = $state(0);
	let viewportHeight = $state(0);

	$effect(() => {
		table.markBodyRowsInitialized();
	});

	$effect(() => {
		table.setLogicalBodyRows(items?.map((item) => item.id));
		return () => {
			table.setLogicalBodyRows(undefined);
		};
	});

	const itemList = $derived(items ?? []);
	const isItemsMode = $derived(items !== undefined);
	const virtualizerEnabled = $derived(Boolean(virtualizer && itemList.length > 0));
	const bodyColumnCount = $derived.by(() => {
		void table.layoutEpoch;
		return Math.max(table.getVisibleColumnCount(), 1);
	});
	const effectiveViewportHeight = $derived.by(() => {
		if (!virtualizer) return 0;
		if (viewportHeight > 0) return viewportHeight;
		return Math.min(itemList.length, 12) * virtualizer.rowHeight;
	});
	const visibleCount = $derived.by(() => {
		if (!virtualizer || !virtualizerEnabled || itemList.length === 0) return 0;
		return Math.max(1, Math.ceil(effectiveViewportHeight / virtualizer.rowHeight));
	});
	/**
	 * Rows rendered beyond each edge of the viewport.
	 *
	 * This is a buffer against how long a row takes to render: while the main
	 * thread is busy building rows, the compositor keeps scrolling the layer, and
	 * anything past the last rendered row shows as blank.
	 *
	 * Lowering it makes every frame measurably cheaper (18 -> 8 cut resize p50 by
	 * 41% and fast-scroll p50 by 30%) — but that is the buffer being spent, not
	 * the cost being fixed, and fast scrolling then shows the blank band the
	 * buffer existed to hide. Do NOT lower this to buy frame time; make row
	 * rendering cheaper instead.
	 */
	const overscan = $derived.by(() => {
		if (!virtualizer || !virtualizerEnabled) return 0;

		// Resizing rewrites a column width every drag frame, and each rewrite
		// relayouts the whole table — a cost proportional to how many rows are
		// mounted. The buffer exists to absorb *scrolling*, and the pointer cannot
		// scroll while dragging a resizer, so during a drag those extra rows are
		// laid out repeatedly for nothing. Measured against a control that keeps
		// the buffer (5000 rows x 8 resizable columns, prod, 4x CPU throttle):
		// resize p50 87.7ms -> 48.5ms, p95 109.5ms -> 70.3ms. The rows come back
		// as soon as the drag ends.
		if (table.resizingColumnId !== null) return 0;

		if (virtualizer.overscan !== undefined) return Math.max(0, virtualizer.overscan);
		return 18;
	});

	// Plain (non-reactive) memo of the last window, used only to keep the derived
	// value's identity stable across recomputations that produce the same window.
	let lastVisibleRange:
		| { from: number; to: number; topSpacerHeight: number; bottomSpacerHeight: number }
		| undefined;

	const visibleRange = $derived.by(() => {
		if (!virtualizer || !virtualizerEnabled || itemList.length === 0) {
			return {
				from: 0,
				to: Math.max(itemList.length - 1, 0),
				topSpacerHeight: 0,
				bottomSpacerHeight: 0
			};
		}

		const rowHeight = virtualizer.rowHeight;
		const rowCount = itemList.length;
		const startIndex = Math.min(rowCount - 1, Math.floor(Math.max(0, scrollTop) / rowHeight));
		const endIndex = Math.min(rowCount - 1, startIndex + visibleCount - 1);

		// Snap the window edges to a block boundary so scrolling *within* a block
		// leaves the rendered set identical.
		//
		// Inserting or removing a <tr> forces the browser to lay out the whole
		// table, and that relayout — not the new rows themselves — is the dominant
		// cost of scrolling: ~1.16ms per mounted row, ~62% of a frame that changes
		// the window. Re-slicing on every single row wastes the overscan buffer,
		// which exists precisely so the window need not track the scroll offset
		// exactly. Quantizing spends that buffer on skipping relayouts instead.
		//
		// Safe by construction: `from` only ever rounds *down* and `to` only ever
		// rounds *up*, so the retained margin never drops below `overscan` and this
		// cannot expose a blank band the unquantized window would have covered.
		//
		// Block size swept against a `block = 1` control (which reproduces the
		// unquantized behaviour) within one build, 5000 rows x 8 resizable columns,
		// prod, 4x CPU throttle:
		//
		//   block | scroll-fast p50 | scroll-smooth p95 | scroll-wheel p95
		//       1 |        125.0 ms |          128.5 ms |         324.7 ms
		//       5 |         26.5 ms |           61.8 ms |         280.5 ms
		//       9 |         22.8 ms |           46.3 ms |         348.3 ms
		//
		// Bigger blocks skip more relayouts but mount more rows, making each
		// structural change costlier. A wheel flick crosses a block almost every
		// notch, so it pays that cost without collecting the benefit — at
		// overscan/2 its p95 regresses. overscan/4 improves all three.
		const block = Math.max(1, Math.round(overscan / 4));
		const rawFrom = Math.max(0, startIndex - overscan);
		const rawTo = Math.min(rowCount - 1, endIndex + overscan);
		const from = Math.max(0, Math.floor(rawFrom / block) * block);
		const to = Math.max(from, Math.min(rowCount - 1, Math.ceil((rawTo + 1) / block) * block - 1));

		const topSpacerHeight = from * rowHeight;
		const bottomSpacerHeight = Math.max(0, (rowCount - to - 1) * rowHeight);

		// Return the *same object* when nothing about the window changed. Scrolling
		// within a block recomputes this on every scroll event, and a fresh object
		// would invalidate `renderedItems`, allocate a new slice and make the keyed
		// each re-diff every mounted row — all to arrive at the identical DOM.
		// Preserving identity makes those frames genuinely free.
		if (
			lastVisibleRange !== undefined &&
			lastVisibleRange.from === from &&
			lastVisibleRange.to === to &&
			lastVisibleRange.topSpacerHeight === topSpacerHeight &&
			lastVisibleRange.bottomSpacerHeight === bottomSpacerHeight
		) {
			return lastVisibleRange;
		}

		lastVisibleRange = { from, to, topSpacerHeight, bottomSpacerHeight };
		return lastVisibleRange;
	});
	const renderedItems = $derived.by(() => {
		if (!virtualizerEnabled) return itemList;
		return itemList.slice(visibleRange.from, visibleRange.to + 1);
	});

	const isEmpty = $derived.by(() => {
		void table.layoutEpoch;
		return table.getLogicalBodyRowCount() === 0;
	});

	function findScrollContainer(node: HTMLElement) {
		const tableElement = node.closest('table');
		let current = tableElement?.parentElement ?? node.parentElement;

		while (current) {
			const style = window.getComputedStyle(current);
			if (
				/(auto|scroll|overlay)/.test(style.overflowY) ||
				/(auto|scroll|overlay)/.test(style.overflow)
			) {
				return current;
			}
			current = current.parentElement;
		}

		return null;
	}

	$effect(() => {
		if (!bodyElement || !virtualizerEnabled || typeof window === 'undefined') return;

		const scrollContainer = findScrollContainer(bodyElement);
		if (!scrollContainer) return;

		const setMetrics = () => {
			viewportHeight = scrollContainer.clientHeight;
			scrollTop = scrollContainer.scrollTop;
		};

		const updateMetrics = () => {
			flushSync(setMetrics);
		};

		const handleScroll = () => {
			flushSync(setMetrics);
		};

		updateMetrics();

		const resizeObserver =
			typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateMetrics) : null;

		scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
		resizeObserver?.observe(scrollContainer);

		return () => {
			scrollContainer.removeEventListener('scroll', handleScroll);
			resizeObserver?.disconnect();
		};
	});
</script>

<tbody
	bind:this={bodyElement}
	class={className}
	data-table-body
	data-empty={isEmpty || undefined}
	{...restProps}
>
	{#if isItemsMode}
		{#if virtualizerEnabled && visibleRange.topSpacerHeight > 0}
			<tr aria-hidden="true" data-virtual-spacer="top">
				<td colspan={bodyColumnCount} style="padding:0;border:0;height:0;">
					<div aria-hidden="true" style={`height:${visibleRange.topSpacerHeight}px;`}></div>
				</td>
			</tr>
		{/if}

		{#each renderedItems as item (item.id)}
			{#if children}
				{@render (children as Snippet<[T]>)(item)}
			{/if}
		{/each}

		{#if virtualizerEnabled && visibleRange.bottomSpacerHeight > 0}
			<tr aria-hidden="true" data-virtual-spacer="bottom">
				<td colspan={bodyColumnCount} style="padding:0;border:0;height:0;">
					<div aria-hidden="true" style={`height:${visibleRange.bottomSpacerHeight}px;`}></div>
				</td>
			</tr>
		{/if}

		{#if empty && isEmpty}
			{@render (empty as Snippet)()}
		{/if}
	{:else if children}
		{@render (children as Snippet)()}
	{/if}
</tbody>
