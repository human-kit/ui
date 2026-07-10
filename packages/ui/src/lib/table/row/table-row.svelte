<script lang="ts">
	import { onDestroy } from 'svelte';
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
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
		disabled = false,
		children,
		class: className = '',
		...restProps
	}: TableRowProps = $props();

	const table = useTableContext();
	const section = useTableSectionContext();
	const rowToken = table.createInstanceToken('row');
	const cellOrder: string[] = [];
	const cellOrderSet = new SvelteSet<string>();
	const cellIndexByToken = new SvelteMap<string, number>();
	const cellElements: Record<string, () => HTMLElement | undefined> = {};
	const cellOrderVersion = writable(0);
	const isBodyRow = section.section === 'body';
	const shouldSeedInitialRegistration = true;
	const rowState = writable({
		isSelected: false,
		isAriaDisabled: false,
		isSelectionDisabled: false,
		isActionable: false
	});
	let bodyCellOrderSealed = !isBodyRow;

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
					disabled
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
					disabled
				)
		});
	}
	let tracksDynamicBodyCellOrder = !isBodyRow;

	let rowElement = $state<HTMLTableRowElement | undefined>(undefined);

	function notifyCellOrderChange() {
		cellOrderVersion.update((value) => value + 1);
	}

	function promoteBodyCellOrderTracking() {
		if (!isBodyRow || tracksDynamicBodyCellOrder) return;
		tracksDynamicBodyCellOrder = true;
		notifyCellOrderChange();
	}

	function registerCellToken(token: string, getElement?: () => HTMLElement | undefined) {
		const alreadyOrdered = cellOrderSet.has(token);
		if (!alreadyOrdered) {
			cellOrderSet.add(token);
			cellIndexByToken.set(token, cellOrder.length);
			cellOrder.push(token);
		}
		if (getElement) {
			cellElements[token] = getElement;
		}

		if (isBodyRow && !tracksDynamicBodyCellOrder) {
			if (bodyCellOrderSealed && !alreadyOrdered) {
				promoteBodyCellOrderTracking();
			}
			return;
		}

		if (!alreadyOrdered) {
			notifyCellOrderChange();
		}
	}

	function unregisterCellToken(token: string) {
		delete cellElements[token];
		const index = cellIndexByToken.get(token) ?? -1;
		if (index >= 0) {
			cellOrder.splice(index, 1);
			cellOrderSet.delete(token);
			cellIndexByToken.delete(token);
			for (let nextIndex = index; nextIndex < cellOrder.length; nextIndex += 1) {
				cellIndexByToken.set(cellOrder[nextIndex], nextIndex);
			}
			if (isBodyRow && !tracksDynamicBodyCellOrder) {
				if (bodyCellOrderSealed) {
					promoteBodyCellOrderTracking();
				}
				return;
			}

			notifyCellOrderChange();
		}
	}

	function getCellIndex(token: string) {
		const element = cellElements[token]?.();
		if ((section.section !== 'body' || tracksDynamicBodyCellOrder) && rowElement && element) {
			const index = Array.from(rowElement.children).indexOf(element);
			if (index >= 0) return index;
		}
		return cellIndexByToken.get(token) ?? -1;
	}

	setTableRowContext({
		rowToken,
		section: section.section,
		get rowId() {
			return id;
		},
		get isDisabled() {
			return disabled;
		},
		rowState,
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
			disabled,
			element: rowElement
		});
	}

	if (shouldSeedInitialRegistration) {
		syncRowRegistration();
	}

	$effect(() => {
		syncRowRegistration();
	});

	$effect(() => {
		if (!rowElement) {
			return;
		}

		let disposed = false;
		if (isBodyRow) {
			queueMicrotask(() => {
				if (!disposed) {
					bodyCellOrderSealed = true;
				}
			});
		}

		const observer = new MutationObserver(() => {
			if (isBodyRow && !bodyCellOrderSealed) {
				return;
			}

			if (!isBodyRow) {
				table.notifyLayoutChange();
				return;
			}

			if (isBodyRow && !tracksDynamicBodyCellOrder) {
				promoteBodyCellOrderTracking();
				return;
			}

			scheduleCellOrderNotify();
		});
		observer.observe(rowElement, { childList: true });

		return () => {
			disposed = true;
			observer.disconnect();
		};
	});

	let pendingCellOrderNotify = false;

	function scheduleCellOrderNotify() {
		if (!pendingCellOrderNotify) {
			pendingCellOrderNotify = true;
			queueMicrotask(() => {
				pendingCellOrderNotify = false;
				notifyCellOrderChange();
			});
		}
	}

	onDestroy(() => {
		table.unregisterRow(rowToken);
	});

	const selectionVersion = table.selectionVersion;
	const focusVersion = table.focusVersion;
	const layoutVersion = table.layoutVersion;
	const ariaRowIndex = $derived.by(() => {
		void $layoutVersion;
		return table.getRowAriaIndex(rowToken);
	});
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
		return section.section === 'body' ? table.isRowDisabled(id, disabled) : disabled;
	});
	const isSelectionDisabled = $derived.by(() => {
		void $selectionVersion;
		return section.section === 'body' ? table.isRowSelectionDisabled(id, disabled) : disabled;
	});
	const isActionable = $derived.by(() => {
		void $selectionVersion;
		return section.section === 'body' ? table.isRowActionable(id, disabled) : false;
	});

	$effect(() => {
		const next = {
			isSelected,
			isAriaDisabled,
			isSelectionDisabled,
			isActionable
		};

		rowState.update((current) =>
			current.isSelected === next.isSelected &&
			current.isAriaDisabled === next.isAriaDisabled &&
			current.isSelectionDisabled === next.isSelectionDisabled &&
			current.isActionable === next.isActionable
				? current
				: next
		);
	});
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
	aria-rowindex={ariaRowIndex}
	onfocus={handleFocus}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</tr>
