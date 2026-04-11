<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		setTableCellContext,
		useTableContext,
		useTableRowContext,
		type TableSelectionKey
	} from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type TableCellProps = Omit<HTMLAttributes<HTMLTableCellElement>, 'children'> & {
		children?: Snippet;
		class?: string;
	};

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

	setTableCellContext({
		cellKey: key,
		registerFocusDelegate,
		unregisterFocusDelegate
	});

	syncCellRegistration();

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
		table.pressRow(row.rowId as TableSelectionKey | undefined, {
			shiftKey: event.shiftKey,
			ctrlKey: event.ctrlKey,
			metaKey: event.metaKey,
			altKey: event.altKey
		});
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, element ?? null);
		table.setFocusVisible(false);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (row.section !== 'body') return;
		trackInteractionModality(event, element ?? null);

		if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'a') {
			if (table.selectionMode === 'multiple') {
				event.preventDefault();
				table.selectAllRows();
			}
			return;
		}

		if ((event.ctrlKey || event.metaKey) && event.key === 'Home') {
			event.preventDefault();
			table.moveToGridStart();
			return;
		}

		if ((event.ctrlKey || event.metaKey) && event.key === 'End') {
			event.preventDefault();
			table.moveToGridEnd();
			return;
		}

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				table.moveFocus('up', {
					shiftKey: event.shiftKey,
					ctrlKey: event.ctrlKey,
					metaKey: event.metaKey,
					altKey: event.altKey
				});
				return;
			case 'ArrowDown':
				event.preventDefault();
				table.moveFocus('down', {
					shiftKey: event.shiftKey,
					ctrlKey: event.ctrlKey,
					metaKey: event.metaKey,
					altKey: event.altKey
				});
				return;
			case 'ArrowLeft':
				event.preventDefault();
				table.moveFocus('left');
				return;
			case 'ArrowRight':
				event.preventDefault();
				table.moveFocus('right');
				return;
			case 'Home':
				event.preventDefault();
				table.moveToRowStart();
				return;
			case 'End':
				event.preventDefault();
				table.moveToRowEnd();
				return;
			case 'Enter':
			case ' ':
				event.preventDefault();
				if (event.repeat) {
					return;
				}
				if (!isRowDisabled) {
					table.pressRow(row.rowId as TableSelectionKey | undefined, {
						shiftKey: event.shiftKey,
						ctrlKey: event.ctrlKey,
						metaKey: event.metaKey,
						altKey: event.altKey
					});
				}
				return;
		}
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
	aria-disabled={row.section === 'body' && isRowDisabled ? true : undefined}
	data-focused={isFocused ? 'true' : undefined}
	data-focus-visible={isFocusVisible ? 'true' : undefined}
	data-row-selected={isRowSelected ? 'true' : undefined}
	data-disabled={isRowDisabled || undefined}
	data-column-index={visibleColumnIndex >= 0 ? visibleColumnIndex : undefined}
	style:display={isColumnHidden ? 'none' : undefined}
	onfocus={handleFocus}
	onclick={handleClick}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</svelte:element>
