<script lang="ts">
	import { onDestroy } from 'svelte';
	import {
		setTableCellContext,
		useTableColumnContext,
		useTableContext,
		useTableRowContext
	} from '../root/context';
	import type { TableColumnHeaderCellProps } from '../types.js';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	let { children, class: className = '', ...restProps }: TableColumnHeaderCellProps = $props();

	const table = useTableContext();
	const column = useTableColumnContext();
	const row = useTableRowContext();
	const key = table.createInstanceToken('header-cell');
	const focusVersion = table.focusVersion;
	const layoutVersion = table.layoutVersion;
	const sortVersion = table.sortVersion;
	const widthVersion = table.widthVersion;

	let element = $state<HTMLElement | undefined>(undefined);
	let focusDelegate = $state<(() => HTMLElement | undefined) | undefined>(undefined);
	let isElementFocused = $state(false);
	let isElementFocusVisible = $state(false);
	let isFocusWithin = $state(false);
	let isFocusVisibleWithin = $state(false);
	row.registerCellToken(key, () => element);
	function syncHeaderCellRegistration() {
		table.registerCell({
			key,
			rowToken: row.rowToken,
			section: 'header',
			columnToken: column.token,
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

	function notifyResizerPresent() {
		// No-op. Header cells now always provide the positioning context that
		// column resizers need so the handle is available in SSR HTML too.
	}

	function notifyResizerRemoved() {
		// No-op. See notifyResizerPresent().
	}

	setTableCellContext({
		cellKey: key,
		registerFocusDelegate,
		unregisterFocusDelegate,
		notifyResizerPresent,
		notifyResizerRemoved
	});

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
		return table.isCellFocused(key) && isElementFocused;
	});
	const isFocusVisible = $derived.by(() => {
		void $focusVersion;
		return isFocused && isElementFocusVisible;
	});
	const sortDirection = $derived.by(() => {
		void $sortVersion;
		return table.getSortDirection(column.id);
	});
	const isHidden = $derived.by(() => {
		void $layoutVersion;
		return column.isHidden;
	});
	const columnWidthStyle = $derived.by(() => {
		void $widthVersion;
		return table.getColumnWidthStyle(column.id);
	});
	const columnMinWidth = $derived.by(() => {
		void $widthVersion;
		return table.getColumnMinWidth(column.id);
	});
	const columnMaxWidth = $derived.by(() => {
		void $widthVersion;
		return table.getColumnMaxWidth(column.id);
	});
	const visibleColumnIndex = $derived.by(() => {
		void $layoutVersion;
		return table.getVisibleColumnIndexByToken(column.token);
	});
	const isSortable = $derived.by(() => {
		void $layoutVersion;
		void $sortVersion;
		return table.isColumnSortable(column.id);
	});
	const headerTabIndex = $derived.by(() => {
		if (isHidden || focusDelegate) return undefined;
		return table.isCellTabStop(key) ? 0 : -1;
	});
	// A pinned header cell stays put while the rest scroll under it. Its z-index (3)
	// sits above the column resizers (z-index 2) so their handles slide underneath
	// instead of floating over the frozen column.
	const pinState = $derived.by(() => {
		void $layoutVersion;
		void $widthVersion;
		return table.getColumnPinState(column.id);
	});

	function focusResizerInHeader(target: HTMLElement | undefined) {
		const resizer = target?.querySelector<HTMLElement>('[data-table-column-resizer="true"]');
		if (!resizer) return false;
		resizer.focus();
		return document.activeElement === resizer;
	}

	function getSiblingHeaderCell(direction: 'left' | 'right') {
		const headerRow = element?.closest('tr');
		if (!headerRow || !element) return null;

		const headerCells = Array.from(
			headerRow.querySelectorAll<HTMLElement>('th[role="columnheader"]')
		);
		const currentIndex = headerCells.indexOf(element);
		if (currentIndex < 0) return null;

		return headerCells[currentIndex + (direction === 'left' ? -1 : 1)] ?? null;
	}

	function moveFocusIntoResizeHandle(direction: 'left' | 'right') {
		if (direction === 'right') {
			return focusResizerInHeader(element);
		}

		return focusResizerInHeader(getSiblingHeaderCell('left') ?? undefined);
	}

	function handleFocus() {
		isElementFocused = true;
		isElementFocusVisible = shouldShowFocusVisible(element ?? null);
		table.setFocusedCell(key);
		table.setFocusVisible(isElementFocusVisible);
	}

	function handleBlur() {
		isElementFocused = false;
		isElementFocusVisible = false;
	}

	function handleFocusIn(event: FocusEvent) {
		if (event.target === element) {
			isFocusWithin = false;
			isFocusVisibleWithin = false;
			return;
		}
		isFocusWithin = true;
		isFocusVisibleWithin = shouldShowFocusVisible(event.target as HTMLElement | null);
	}

	function handleFocusOut(event: FocusEvent) {
		const nextFocused = event.relatedTarget;
		if (nextFocused instanceof Node && element?.contains(nextFocused)) return;
		isFocusWithin = false;
		isFocusVisibleWithin = false;
	}

	function handleClick() {
		table.focusCellByKey(key);
		table.consumeHeaderClickSuppression();
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, element ?? null);
		isElementFocusVisible = false;
		isFocusVisibleWithin = false;
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
				if (moveFocusIntoResizeHandle('left')) return;
				table.moveFocus('left');
				return;
			case 'ArrowRight':
				event.preventDefault();
				if (moveFocusIntoResizeHandle('right')) return;
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
		}
	}
</script>

<th
	bind:this={element}
	role="columnheader"
	class={className}
	tabindex={headerTabIndex}
	aria-colindex={!isHidden && visibleColumnIndex >= 0 ? visibleColumnIndex + 1 : undefined}
	aria-hidden={isHidden ? true : undefined}
	aria-sort={isSortable ? (sortDirection ?? 'none') : undefined}
	data-focused={isFocused ? 'true' : undefined}
	data-focus-visible={isFocusVisible ? 'true' : undefined}
	data-focus-within={isFocusWithin ? 'true' : undefined}
	data-focus-visible-within={isFocusVisibleWithin ? 'true' : undefined}
	data-sortable={isSortable || undefined}
	data-sort-direction={sortDirection}
	data-column-index={visibleColumnIndex >= 0 ? visibleColumnIndex : undefined}
	data-pinned={pinState?.side}
	data-pin-edge={pinState?.isEdge ? 'true' : undefined}
	style:box-sizing="border-box"
	style:position={pinState ? 'sticky' : 'relative'}
	style:left={pinState?.side === 'left' ? `${pinState.offset}px` : undefined}
	style:right={pinState?.side === 'right' ? `${pinState.offset}px` : undefined}
	style:z-index={pinState ? 3 : undefined}
	style:overflow="visible"
	style:width={columnWidthStyle}
	style:min-width={columnMinWidth !== undefined ? `${columnMinWidth}px` : undefined}
	style:max-width={columnMaxWidth !== undefined ? `${columnMaxWidth}px` : undefined}
	style:display={isHidden ? 'none' : 'table-cell'}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onfocus={handleFocus}
	onblur={handleBlur}
	onclick={handleClick}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</th>
