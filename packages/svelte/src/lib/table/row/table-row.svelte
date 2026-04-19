<script lang="ts">
	import { onDestroy } from 'svelte';
	import { SvelteMap } from 'svelte/reactivity';
	import { writable } from 'svelte/store';
	import { setTableRowContext, useTableContext, useTableSectionContext } from '../root/context';
	import type { TableRowProps } from '../types.js';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { handleTableBodyKeydown } from '../utils/handle-body-keydown';

	let {
		id,
		isDisabled = false,
		children,
		class: className = '',
		...restProps
	}: TableRowProps = $props();

	const table = useTableContext();
	const section = useTableSectionContext();
	const rowToken = table.createInstanceToken('row');
	const cellOrder: string[] = [];
	const cellElements = new SvelteMap<string, () => HTMLElement | undefined>();
	const cellOrderVersion = writable(0);

	let rowElement = $state<HTMLTableRowElement | undefined>(undefined);
	let childListObserver: MutationObserver | null = null;

	function notifyCellOrderChange() {
		cellIndexCache = null;
		cellOrderVersion.update((value) => value + 1);
	}

	function registerCellToken(token: string, getElement?: () => HTMLElement | undefined) {
		if (!cellOrder.includes(token)) {
			cellOrder.push(token);
			notifyCellOrderChange();
		}
		if (getElement) {
			cellElements.set(token, getElement);
		}
	}

	function unregisterCellToken(token: string) {
		cellElements.delete(token);
		const index = cellOrder.indexOf(token);
		if (index >= 0) {
			cellOrder.splice(index, 1);
			notifyCellOrderChange();
		}
	}

	let cellIndexCache: Map<string, number> | null = null;

	function buildCellIndexCache(): Map<string, number> {
		if (cellIndexCache) return cellIndexCache;
		// eslint-disable-next-line svelte/prefer-svelte-reactivity -- plain cache, not reactive state
		const cache = new Map<string, number>();
		if (rowElement) {
			const directCells = rowElement.children;
			// eslint-disable-next-line svelte/prefer-svelte-reactivity -- plain cache, not reactive state
			const elementToIndex = new Map<HTMLElement, number>();
			for (let i = 0; i < directCells.length; i += 1) {
				const child = directCells[i];
				if (child instanceof HTMLElement) {
					elementToIndex.set(child, i);
				}
			}
			for (const registeredToken of cellOrder) {
				const element = cellElements.get(registeredToken)?.();
				if (element) {
					const idx = elementToIndex.get(element);
					if (idx !== undefined) {
						cache.set(registeredToken, idx);
					}
				}
			}
		}
		cellIndexCache = cache;
		return cache;
	}

	function getCellIndex(token: string) {
		const cache = buildCellIndexCache();
		const cached = cache.get(token);
		if (cached !== undefined) return cached;
		return cellOrder.indexOf(token);
	}

	setTableRowContext({
		rowToken,
		section: section.section,
		get rowId() {
			return id;
		},
		get isDisabled() {
			return isDisabled;
		},
		cellOrderVersion,
		registerCellToken,
		unregisterCellToken,
		getCellIndex
	});

	function syncRowRegistration() {
		table.registerRow({
			token: rowToken,
			section: section.section,
			id,
			disabled: isDisabled,
			element: rowElement
		});
	}

	syncRowRegistration();

	$effect(() => {
		syncRowRegistration();
	});

	let pendingCellOrderNotify = false;

	function scheduleCellOrderNotify() {
		if (!pendingCellOrderNotify) {
			pendingCellOrderNotify = true;
			queueMicrotask(() => {
				pendingCellOrderNotify = false;
				cellIndexCache = null;
				notifyCellOrderChange();
			});
		}
	}

	$effect(() => {
		childListObserver?.disconnect();
		childListObserver = null;

		if (!rowElement) {
			return;
		}

		const observer = new MutationObserver(() => {
			scheduleCellOrderNotify();
		});
		observer.observe(rowElement, { childList: true });
		childListObserver = observer;

		return () => {
			observer.disconnect();
			if (childListObserver === observer) {
				childListObserver = null;
			}
		};
	});

	onDestroy(() => {
		childListObserver?.disconnect();
		table.unregisterRow(rowToken);
	});

	const selectionVersion = table.selectionVersion;
	const focusVersion = table.focusVersion;
	const isSelected = $derived.by(() => {
		void $selectionVersion;
		return section.section === 'body' ? table.isRowSelected(id) : false;
	});
	const isFocusWithin = $derived.by(() => {
		void $focusVersion;
		return section.section === 'body' ? table.isRowFocused(rowToken) : false;
	});
	const isFocused = $derived.by(() => {
		void $focusVersion;
		return section.section === 'body' ? table.isRowFocusTarget(rowToken) : false;
	});
	const isFocusVisible = $derived.by(() => {
		void $focusVersion;
		return section.section === 'body' ? isFocused && table.focusVisible : false;
	});
	const isFocusVisibleWithin = $derived.by(() => {
		void $focusVersion;
		return section.section === 'body' ? isFocusWithin && table.focusVisible : false;
	});
	const isAriaDisabled = $derived.by(() => {
		void $selectionVersion;
		return section.section === 'body' ? table.isRowDisabled(id, isDisabled) : isDisabled;
	});
	const isSelectionDisabled = $derived.by(() => {
		void $selectionVersion;
		return section.section === 'body' ? table.isRowSelectionDisabled(id, isDisabled) : isDisabled;
	});
	const isActionable = $derived.by(() => {
		void $selectionVersion;
		return section.section === 'body' ? table.isRowActionable(id, isDisabled) : false;
	});

	function handleFocus() {
		if (section.section !== 'body') return;
		if (isAriaDisabled) return;
		if (!table.isRowTabStop(rowToken)) return;
		table.setFocusedRow(rowToken, table.getRowFocusEdge(rowToken) ?? 'start');
		table.setFocusVisible(shouldShowFocusVisible(rowElement ?? null));
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, rowElement ?? null);
		table.setFocusVisible(false);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (section.section !== 'body') return;
		if (event.target !== rowElement) return;
		handleTableBodyKeydown({
			event,
			table,
			focusTarget: rowElement,
			isDisabled: isAriaDisabled,
			onHome: () => table.moveToBodyRowStart(),
			onEnd: () => table.moveToBodyRowEnd(),
			onEnter: () =>
				table.pressRow(
					id,
					'keyboard-enter',
					{
						shiftKey: event.shiftKey,
						ctrlKey: event.ctrlKey,
						metaKey: event.metaKey,
						altKey: event.altKey
					},
					isDisabled
				),
			onSpace: () =>
				table.pressRow(
					id,
					'keyboard-space',
					{
						shiftKey: event.shiftKey,
						ctrlKey: event.ctrlKey,
						metaKey: event.metaKey,
						altKey: event.altKey
					},
					isDisabled
				)
		});
	}
</script>

<tr
	bind:this={rowElement}
	class={className}
	tabindex={section.section === 'body'
		? !isAriaDisabled
			? table.isRowTabStop(rowToken)
				? 0
				: -1
			: undefined
		: undefined}
	data-focused={isFocused ? 'true' : undefined}
	data-focus-visible={isFocusVisible ? 'true' : undefined}
	data-focus-within={isFocusWithin ? 'true' : undefined}
	data-focus-visible-within={isFocusVisibleWithin ? 'true' : undefined}
	data-actionable={isActionable ? 'true' : undefined}
	data-selected={isSelected ? 'true' : undefined}
	data-selection-disabled={section.section === 'body' &&
	table.selectionMode !== 'none' &&
	!isAriaDisabled &&
	isSelectionDisabled
		? 'true'
		: undefined}
	data-disabled={isAriaDisabled || undefined}
	aria-selected={section.section === 'body' && table.selectionMode !== 'none'
		? isSelected
		: undefined}
	aria-disabled={section.section === 'body' && isAriaDisabled ? true : undefined}
	onfocus={handleFocus}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</tr>
