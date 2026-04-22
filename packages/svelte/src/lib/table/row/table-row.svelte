<script lang="ts">
	import { onDestroy } from 'svelte';
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
	const cellElements: Record<string, () => HTMLElement | undefined> = {};
	const cellOrderVersion = writable(0);

	let rowElement = $state<HTMLTableRowElement | undefined>(undefined);

	function notifyCellOrderChange() {
		cellOrderVersion.update((value) => value + 1);
	}

	function registerCellToken(token: string, getElement?: () => HTMLElement | undefined) {
		if (!cellOrder.includes(token)) {
			cellOrder.push(token);
			notifyCellOrderChange();
		}
		if (getElement) {
			cellElements[token] = getElement;
		}
	}

	function unregisterCellToken(token: string) {
		delete cellElements[token];
		const index = cellOrder.indexOf(token);
		if (index >= 0) {
			cellOrder.splice(index, 1);
			notifyCellOrderChange();
		}
	}

	function getCellIndex(token: string) {
		const element = cellElements[token]?.();
		if (rowElement && element) {
			const index = Array.from(rowElement.children).indexOf(element);
			if (index >= 0) return index;
		}
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

	$effect(() => {
		if (!rowElement) {
			return;
		}

		const observer = new MutationObserver(() => {
			scheduleCellOrderNotify();
		});
		observer.observe(rowElement, { childList: true });

		return () => {
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
