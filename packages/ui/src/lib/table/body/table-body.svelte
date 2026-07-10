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
	const overscan = $derived.by(() => {
		if (!virtualizer || !virtualizerEnabled) return 0;
		if (virtualizer.overscan !== undefined) return Math.max(0, virtualizer.overscan);
		return 18;
	});
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
		const from = Math.max(0, startIndex - overscan);
		const to = Math.max(from, Math.min(rowCount - 1, endIndex + overscan));

		return {
			from,
			to,
			topSpacerHeight: from * rowHeight,
			bottomSpacerHeight: Math.max(0, (rowCount - to - 1) * rowHeight)
		};
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
