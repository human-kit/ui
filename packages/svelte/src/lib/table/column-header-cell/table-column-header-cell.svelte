<script module lang="ts">
	let headerCellInstanceId = 0;

	function createHeaderCellKey() {
		headerCellInstanceId += 1;
		return `table-header-cell-${headerCellInstanceId}`;
	}
</script>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { useTableColumnContext, useTableContext, useTableRowContext } from '../root/context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type TableColumnHeaderCellProps = Omit<HTMLAttributes<HTMLTableCellElement>, 'children'> & {
		children?: Snippet;
		class?: string;
	};

	let { children, class: className = '', ...restProps }: TableColumnHeaderCellProps = $props();

	const table = useTableContext();
	const column = useTableColumnContext();
	const row = useTableRowContext();
	const key = createHeaderCellKey();
	const focusVersion = table.focusVersion;
	const sortVersion = table.sortVersion;
	const widthVersion = table.widthVersion;

	let element = $state<HTMLElement | undefined>(undefined);
	const cellIndex = row.registerCellToken(key);

	function syncHeaderCellRegistration() {
		table.registerCell({
			key,
			rowToken: row.rowToken,
			section: 'header',
			columnToken: column.token,
			element
		});
	}

	syncHeaderCellRegistration();

	$effect(() => {
		syncHeaderCellRegistration();
	});

	onDestroy(() => {
		row.unregisterCellToken(key);
		table.unregisterCell(key);
	});

	const isFocused = $derived.by(() => {
		void $focusVersion;
		return table.isCellFocused(key);
	});
	const isFocusVisible = $derived.by(() => {
		void $focusVersion;
		return isFocused && table.focusVisible;
	});
	const sortDirection = $derived.by(() => {
		void $sortVersion;
		return table.getSortDirection(column.id);
	});
	const columnWidth = $derived.by(() => {
		void $widthVersion;
		return table.getColumnWidth(column.id);
	});
	const isResizable = $derived(column.allowsResizing);

	function handleFocus() {
		table.setFocusedCell(key);
		table.setFocusVisible(shouldShowFocusVisible(element ?? null));
	}

	function handleClick() {
		table.focusCellByKey(key);
		if (table.consumeHeaderClickSuppression()) {
			return;
		}
		if (column.allowsSorting) {
			table.toggleSort(column.id);
		}
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, element ?? null);
		table.setFocusVisible(false);
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, element ?? null);

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
				table.moveFocus('up');
				return;
			case 'ArrowDown':
				event.preventDefault();
				table.moveFocus('down');
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
				if (!column.allowsSorting) return;
				event.preventDefault();
				if (event.repeat) return;
				table.toggleSort(column.id);
				return;
		}
	}
</script>

<th
	bind:this={element}
	role="columnheader"
	class={className}
	tabindex={table.isCellTabStop(key) ? 0 : -1}
	aria-sort={column.allowsSorting ? (sortDirection ?? 'none') : undefined}
	data-focused={isFocused ? 'true' : undefined}
	data-focus-visible={isFocusVisible ? 'true' : undefined}
	data-sortable={column.allowsSorting || undefined}
	data-sort-direction={sortDirection}
	data-column-index={cellIndex >= 0 ? cellIndex : undefined}
	style:position={isResizable ? 'relative' : undefined}
	style:width={columnWidth !== undefined ? `${columnWidth}px` : undefined}
	style:overflow={isResizable ? 'visible' : columnWidth !== undefined ? 'hidden' : undefined}
	onfocus={handleFocus}
	onclick={handleClick}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	{...restProps}
>
	<div
		data-table-header-content
		style:overflow={columnWidth !== undefined ? 'hidden' : undefined}
		style:min-width="0"
		style:width="100%"
		style:height="100%"
	>
		{#if children}
			{@render children()}
		{/if}
	</div>
</th>
