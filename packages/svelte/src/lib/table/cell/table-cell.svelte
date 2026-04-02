<script module lang="ts">
	let bodyCellInstanceId = 0;

	function createBodyCellKey() {
		bodyCellInstanceId += 1;
		return `table-cell-${bodyCellInstanceId}`;
	}
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useTableContext, useTableRowContext, type TableSelectionKey } from '../root/context';
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
	const key = createBodyCellKey();
	const layoutVersion = table.layoutVersion;
	const focusVersion = table.focusVersion;
	const selectionVersion = table.selectionVersion;

	let element = $state<HTMLElement | undefined>(undefined);
	const cellIndex = row.registerCellToken(key);

	function syncCellRegistration() {
		if (row.section !== 'body') return;
		table.registerCell({
			key,
			rowToken: row.rowToken,
			section: 'body',
			columnIndex: cellIndex,
			element
		});
	}

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
	const tagName = $derived(row.section === 'body' && column?.isRowHeader ? 'th' : 'td');
	const role = $derived(row.section === 'body' && column?.isRowHeader ? 'rowheader' : 'gridcell');
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

	function handleFocus() {
		if (row.section !== 'body') return;
		table.setFocusedCell(key);
		table.setFocusVisible(shouldShowFocusVisible(element ?? null));
	}

	function toggleSelection() {
		if (row.section !== 'body') return;
		table.toggleRowSelection(row.rowId as TableSelectionKey | undefined);
	}

	function handleClick(event: MouseEvent) {
		if (row.section !== 'body') return;
		table.focusCellByKey(key);
		if (!isRowDisabled) {
			table.pressRow(row.rowId as TableSelectionKey | undefined, {
				shiftKey: event.shiftKey,
				ctrlKey: event.ctrlKey,
				metaKey: event.metaKey,
				altKey: event.altKey
			});
		}
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
	tabindex={row.section === 'body' ? (table.isCellTabStop(key) ? 0 : -1) : undefined}
	scope={row.section === 'body' && column?.isRowHeader ? 'row' : undefined}
	data-focused={isFocused ? 'true' : undefined}
	data-focus-visible={isFocusVisible ? 'true' : undefined}
	data-row-selected={isRowSelected ? 'true' : undefined}
	data-disabled={isRowDisabled || undefined}
	data-column-index={cellIndex >= 0 ? cellIndex : undefined}
	style={row.section === 'body' && !isFocusVisible ? 'outline: none;' : undefined}
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
