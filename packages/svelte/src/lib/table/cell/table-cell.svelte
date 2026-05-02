<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		setTableCellContext,
		useTableContext,
		useTableRowContext,
		type TableSelectionKey
	} from '../root/context';
	import type { TableCellProps } from '../types.js';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { handleTableBodyKeydown } from '../utils/handle-body-keydown';

	let { children, class: className = '', ...restProps }: TableCellProps = $props();

	const table = useTableContext();
	const row = useTableRowContext();
	const key = table.createInstanceToken('cell');
	const layoutVersion = table.layoutVersion;
	const focusVersion = table.focusVersion;
	const selectionVersion = table.selectionVersion;
	const cellOrderVersion = row.cellOrderVersion;

	let element = $state<HTMLElement | undefined>(undefined);
	let focusDelegate = $state<(() => HTMLElement | undefined) | undefined>(undefined);
	row.registerCellToken(key, () => element);
	const cellIndex = $derived.by(() => {
		void $cellOrderVersion;
		return row.getCellIndex(key);
	});

	function syncCellRegistration() {
		if (row.section !== 'body') return;
		table.registerCell({
			key,
			rowToken: row.rowToken,
			section: 'body',
			columnIndex: cellIndex,
			element,
			focusDelegate
		});
	}

	function registerFocusDelegate(getElement: () => HTMLElement | undefined) {
		focusDelegate = getElement;
	}

	function unregisterFocusDelegate() {
		focusDelegate = undefined;
	}

	const shouldSeedClientRegistration = typeof window === 'undefined';

	setTableCellContext({
		cellKey: key,
		registerFocusDelegate,
		unregisterFocusDelegate
	});

	if (shouldSeedClientRegistration) {
		syncCellRegistration();
	}

	$effect(() => {
		syncCellRegistration();
	});

	onDestroy(() => {
		row.unregisterCellToken(key);
		if (row.section === 'body') {
			table.unregisterCell(key);
		}
	});

	const column = $derived.by(() => {
		void $layoutVersion;
		return cellIndex >= 0 ? table.getColumnAt(cellIndex) : undefined;
	});
	const isColumnHidden = $derived.by(() => {
		void $layoutVersion;
		return column ? table.isColumnHidden(column.id) : false;
	});
	const visibleColumnIndex = $derived.by(() => {
		void $layoutVersion;
		return column ? table.getVisibleColumnIndexByToken(column.token) : -1;
	});
	const tagName = $derived(row.section === 'body' && column?.isRowHeader ? 'th' : 'td');
	const role = $derived.by(() => {
		if (isColumnHidden) return undefined;
		if (row.section !== 'body') return undefined;
		return column?.isRowHeader ? 'rowheader' : 'gridcell';
	});
	const isFocused = $derived.by(() => {
		void $focusVersion;
		return row.section === 'body' ? table.isCellFocused(key) : false;
	});
	const isFocusVisible = $derived.by(() => {
		void $focusVersion;
		return row.section === 'body' ? isFocused && table.focusVisible : false;
	});
	const isRowSelected = $derived.by(() => {
		void $selectionVersion;
		return row.section === 'body' ? table.isRowSelected(row.rowId) : false;
	});
	const isRowDisabled = $derived.by(() => {
		void $selectionVersion;
		return row.section === 'body' ? table.isRowDisabled(row.rowId, row.isDisabled) : row.isDisabled;
	});
	const isRowSelectionDisabled = $derived.by(() => {
		void $selectionVersion;
		return row.section === 'body'
			? table.isRowSelectionDisabled(row.rowId, row.isDisabled)
			: row.isDisabled;
	});
	const isRowActionable = $derived.by(() => {
		void $selectionVersion;
		return row.section === 'body' ? table.isRowActionable(row.rowId, row.isDisabled) : false;
	});
	const selectionUnavailableDescription = $derived.by(() => {
		return row.section === 'body' &&
			table.selectionMode !== 'none' &&
			!isRowDisabled &&
			isRowSelectionDisabled
			? 'Selection unavailable for this row.'
			: undefined;
	});
	const selectionUnavailableDescriptionId = $derived(
		selectionUnavailableDescription ? table.selectionUnavailableDescriptionId : undefined
	);
	const isCellFocusable = $derived(row.section !== 'body' || !isRowDisabled);
	const cellTabIndex = $derived.by(() => {
		if (row.section !== 'body') return undefined;
		if (isColumnHidden) return undefined;
		if (!isCellFocusable) return undefined;
		if (focusDelegate) return undefined;
		return table.isCellTabStop(key) ? 0 : -1;
	});

	function handleFocus() {
		if (row.section !== 'body' || isRowDisabled) return;
		table.setFocusedCell(key);
		table.setFocusVisible(shouldShowFocusVisible(element ?? null));
	}

	function handleClick(event: MouseEvent) {
		if (row.section !== 'body') return;
		if (isRowDisabled) return;
		table.focusCellByKey(key);
		table.pressRow(
			row.rowId as TableSelectionKey | undefined,
			'pointer',
			{
				shiftKey: event.shiftKey,
				ctrlKey: event.ctrlKey,
				metaKey: event.metaKey,
				altKey: event.altKey
			},
			row.isDisabled
		);
	}

	function handleDoubleClick() {
		if (row.section !== 'body') return;
		if (isRowDisabled) return;
		table.focusCellByKey(key);
		table.pressRow(
			row.rowId as TableSelectionKey | undefined,
			'pointer-double',
			{},
			row.isDisabled
		);
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, element ?? null);
		table.setFocusVisible(false);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (row.section !== 'body') return;
		handleTableBodyKeydown({
			event,
			table,
			focusTarget: element,
			isDisabled: isRowDisabled,
			onHome: () => table.moveToRowStart(),
			onEnd: () => table.moveToRowEnd(),
			onEnter: () =>
				table.pressRow(
					row.rowId as TableSelectionKey | undefined,
					'keyboard-enter',
					{
						shiftKey: event.shiftKey,
						ctrlKey: event.ctrlKey,
						metaKey: event.metaKey,
						altKey: event.altKey
					},
					row.isDisabled
				),
			onSpace: () =>
				table.pressRow(
					row.rowId as TableSelectionKey | undefined,
					'keyboard-space',
					{
						shiftKey: event.shiftKey,
						ctrlKey: event.ctrlKey,
						metaKey: event.metaKey,
						altKey: event.altKey
					},
					row.isDisabled
				)
		});
	}
</script>

<svelte:element
	this={tagName}
	bind:this={element}
	{role}
	class={className}
	tabindex={cellTabIndex}
	scope={row.section === 'body' && column?.isRowHeader ? 'row' : undefined}
	aria-colindex={!isColumnHidden && visibleColumnIndex >= 0 ? visibleColumnIndex + 1 : undefined}
	aria-hidden={isColumnHidden ? true : undefined}
	aria-describedby={selectionUnavailableDescriptionId}
	aria-disabled={row.section === 'body' && isRowDisabled ? true : undefined}
	data-focused={isFocused ? 'true' : undefined}
	data-focus-visible={isFocusVisible ? 'true' : undefined}
	data-actionable={isRowActionable ? 'true' : undefined}
	data-row-selected={isRowSelected ? 'true' : undefined}
	data-selection-disabled={row.section === 'body' &&
	table.selectionMode !== 'none' &&
	!isRowDisabled &&
	isRowSelectionDisabled
		? 'true'
		: undefined}
	data-disabled={isRowDisabled || undefined}
	data-column-index={visibleColumnIndex >= 0 ? visibleColumnIndex : undefined}
	style:box-sizing="border-box"
	style:display={isColumnHidden ? 'none' : 'table-cell'}
	onfocus={row.section === 'body' ? handleFocus : undefined}
	onclick={row.section === 'body' ? handleClick : undefined}
	ondblclick={row.section === 'body' ? handleDoubleClick : undefined}
	onmousedown={row.section === 'body' ? handleMouseDown : undefined}
	onkeydown={row.section === 'body' ? handleKeyDown : undefined}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</svelte:element>
