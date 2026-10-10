<script lang="ts">
	import { onDestroy } from 'svelte';
	import { useTableContext, useTableSectionContext } from '../root/context.svelte';
	import type { TableSectionRowProps } from '../types.js';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { handleTableBodyKeydown } from '../utils/handle-body-keydown';

	let {
		id,
		onAction,
		children,
		class: className = '',
		...restProps
	}: TableSectionRowProps = $props();

	const table = useTableContext();
	const section = useTableSectionContext();
	if (section.section !== 'body') {
		throw new Error('`Table.SectionRow` must be used inside `Table.Body`.');
	}

	const rowToken = table.createInstanceToken('row');
	const cellKey = table.createInstanceToken('cell');

	let rowElement = $state<HTMLTableRowElement | undefined>(undefined);
	let cellElement = $state<HTMLTableCellElement | undefined>(undefined);

	// A section row is a row for navigation only. It registers as one so the
	// arrows walk into and out of it, and flags itself so the selection model
	// (select-all, ranges, the header checkbox) and `onRowAction` skip it.
	function syncRowRegistration() {
		table.registerRow({
			token: rowToken,
			section: 'body',
			id,
			disabled: false,
			isSection: true,
			element: rowElement
		});
	}

	syncRowRegistration();

	$effect(() => {
		syncRowRegistration();
	});

	// Under `'grid'` the single cell is the focus target; it registers at the
	// first visible column (`spansRow`), so moving down from any column lands on
	// it and moving down from it lands on the first column of the next row.
	const isCellFocusTarget = $derived(table.keyboardNavigation === 'grid');
	// Under `'row'` the row itself is the focus target, like any other row.
	const isRowFocusTarget = $derived(table.keyboardNavigation === 'row');

	$effect(() => {
		if (!isCellFocusTarget) return;
		table.registerCell({
			key: cellKey,
			rowToken,
			section: 'body',
			element: cellElement,
			spansRow: true
		});
	});

	onDestroy(() => {
		// Mirrors `isCellFocusTarget` without reading it: a derived is not safe to
		// read while the component tears down.
		if (table.keyboardNavigation === 'grid') {
			table.unregisterCell(cellKey);
		}
		table.unregisterRow(rowToken);
	});

	// The cell covers every visible column, the selection column included: that
	// one is a regular `Table.Column`, so the visible count already has it.
	const columnCount = $derived.by(() => {
		void table.layoutEpoch;
		return Math.max(table.getVisibleColumnCount(), 1);
	});
	const ariaRowIndex = $derived.by(() => {
		void table.layoutEpoch;
		return table.getRowAriaIndex(rowToken);
	});

	const isCellFocused = $derived(isCellFocusTarget ? table.isCellFocused(cellKey) : false);
	const isRowFocused = $derived(isRowFocusTarget ? table.isRowFocusTarget(rowToken) : false);
	const isFocusWithin = $derived(table.isRowFocused(rowToken));
	const isCellFocusVisible = $derived(isCellFocused && table.focusVisible);
	const isRowFocusVisible = $derived(isRowFocused && table.focusVisible);
	const isFocusVisibleWithin = $derived(isFocusWithin && table.focusVisible);

	const cellTabIndex = $derived.by(() => {
		if (!isCellFocusTarget) return undefined;
		if (table.focusedCellKey === null && table.getHeaderRowCount() > 0) return -1;
		return table.isCellTabStop(cellKey) ? 0 : -1;
	});
	const rowTabIndex = $derived.by(() => {
		if (!isRowFocusTarget) return undefined;
		return table.isRowTabStop(rowToken) ? 0 : -1;
	});

	function runAction() {
		onAction?.();
	}

	function handleKeyDown(event: KeyboardEvent, focusTarget: HTMLElement | undefined) {
		handleTableBodyKeydown({
			event,
			table,
			focusTarget,
			isDisabled: false,
			// Under grid navigation the cell is the whole row, so Home and End stay
			// on it. Under row navigation they go to the first and last rows, the
			// same as on any other row.
			onHome: isCellFocusTarget ? () => table.moveToRowStart() : () => table.moveToBodyRowStart(),
			onEnd: isCellFocusTarget ? () => table.moveToRowEnd() : () => table.moveToBodyRowEnd(),
			onEnter: runAction,
			onSpace: runAction
		});
	}

	function handleRowFocus() {
		if (!isRowFocusTarget) return;
		if (!table.isRowTabStop(rowToken)) return;
		table.setFocusedRow(rowToken, table.getRowFocusEdge(rowToken) ?? 'start');
		table.setFocusVisible(shouldShowFocusVisible(rowElement ?? null));
	}

	function handleRowKeyDown(event: KeyboardEvent) {
		if (!isRowFocusTarget) return;
		if (event.target !== rowElement) return;
		handleKeyDown(event, rowElement);
	}

	function handleCellFocus() {
		table.setFocusedCell(cellKey);
		table.setFocusVisible(shouldShowFocusVisible(cellElement ?? null));
	}

	function handleCellKeyDown(event: KeyboardEvent) {
		if (event.target !== cellElement) return;
		handleKeyDown(event, cellElement);
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, cellElement ?? null);
		table.setFocusVisible(false);
	}

	// A press moves focus to whatever the current mode can focus, so the
	// keyboard carries on from the section row; it never goes through
	// `pressRow`, which is what keeps it out of selection and `onRowAction`.
	function handleClick() {
		if (isCellFocusTarget) {
			table.focusCellByKey(cellKey);
		} else if (isRowFocusTarget) {
			table.focusRowByToken(rowToken, 'start');
		}
		runAction();
	}
</script>

<!-- svelte-ignore a11y_no_redundant_roles -->
<tr
	bind:this={rowElement}
	role="row"
	class={className}
	tabindex={rowTabIndex}
	data-section-row
	data-focused={isRowFocused ? 'true' : undefined}
	data-focus-visible={isRowFocusVisible ? 'true' : undefined}
	data-focus-within={isFocusWithin ? 'true' : undefined}
	data-focus-visible-within={isFocusVisibleWithin ? 'true' : undefined}
	aria-rowindex={ariaRowIndex}
	onfocus={handleRowFocus}
	onkeydown={handleRowKeyDown}
	{...restProps}
>
	<td
		bind:this={cellElement}
		role="gridcell"
		colspan={columnCount}
		tabindex={cellTabIndex}
		aria-colindex={1}
		data-focused={isCellFocused ? 'true' : undefined}
		data-focus-visible={isCellFocusVisible ? 'true' : undefined}
		style:box-sizing="border-box"
		onfocus={isCellFocusTarget ? handleCellFocus : undefined}
		onkeydown={isCellFocusTarget ? handleCellKeyDown : undefined}
		onmousedown={handleMouseDown}
		onclick={handleClick}
	>
		{#if children}
			{@render children()}
		{/if}
	</td>
</tr>
