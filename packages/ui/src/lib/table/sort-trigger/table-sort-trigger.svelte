<script lang="ts">
	import type { Snippet } from 'svelte';
	import { useTableCellContext, useTableColumnContext, useTableContext } from '../root/context.svelte';
	import type { TableSortTriggerProps, TableSortTriggerRenderState } from '../types.js';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';
	import { ButtonRoot } from '../../button/index.js';

	type SortTriggerMouseEvent = MouseEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};
	type SortTriggerKeyboardEvent = KeyboardEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};
	type SortTriggerFocusEvent = FocusEvent & {
		currentTarget: EventTarget & HTMLButtonElement;
	};

	let {
		children,
		class: className = '',
		element = $bindable<HTMLButtonElement | null>(null),
		onfocus: onFocusExternal,
		onmousedown: onMouseDownExternal,
		onclick: onClickExternal,
		onkeydown: onKeyDownExternal,
		...restProps
	}: TableSortTriggerProps = $props();

	const table = useTableContext();
	const column = useTableColumnContext();
	const cell = useTableCellContext();

	let buttonRef = $state<HTMLButtonElement | null>(null);

	// Fine-grained: `getSortDirection` reads the reactive sort descriptor.
	const sortDirection = $derived(table.getSortDirection(column.id));
	const renderState = $derived.by<TableSortTriggerRenderState>(() => ({
		sortDirection
	}));

	$effect(() => {
		element = buttonRef;
		table.registerColumnSortTrigger(column.token);

		return () => {
			table.unregisterColumnSortTrigger(column.token);
		};
	});

	function handleFocus(event: SortTriggerFocusEvent) {
		table.setFocusedCell(cell.cellKey);
		table.setFocusVisible(shouldShowFocusVisible(event.currentTarget));
		onFocusExternal?.(event);
	}

	function handleMouseDown(event: SortTriggerMouseEvent) {
		trackInteractionModality(event, event.currentTarget);
		table.setFocusVisible(false);
		event.stopPropagation();
		onMouseDownExternal?.(event);
	}

	function handleClick(event: SortTriggerMouseEvent) {
		event.stopPropagation();
		table.toggleSort(column.id);
		onClickExternal?.(event);
	}

	function handleKeyDown(event: SortTriggerKeyboardEvent) {
		trackInteractionModality(event, event.currentTarget);

		if ((event.ctrlKey || event.metaKey) && event.key === 'Home') {
			event.preventDefault();
			event.stopPropagation();
			table.moveToGridStart();
			return;
		}

		if ((event.ctrlKey || event.metaKey) && event.key === 'End') {
			event.preventDefault();
			event.stopPropagation();
			table.moveToGridEnd();
			return;
		}

		switch (event.key) {
			case 'ArrowUp':
				event.preventDefault();
				event.stopPropagation();
				table.moveFocus('up', {
					shiftKey: event.shiftKey,
					ctrlKey: event.ctrlKey,
					metaKey: event.metaKey,
					altKey: event.altKey
				});
				return;
			case 'ArrowDown':
				event.preventDefault();
				event.stopPropagation();
				table.moveFocus('down', {
					shiftKey: event.shiftKey,
					ctrlKey: event.ctrlKey,
					metaKey: event.metaKey,
					altKey: event.altKey
				});
				return;
			case 'ArrowLeft':
				event.preventDefault();
				event.stopPropagation();
				table.moveFocus('left');
				return;
			case 'ArrowRight':
				event.preventDefault();
				event.stopPropagation();
				table.moveFocus('right');
				return;
			case 'Home':
				event.preventDefault();
				event.stopPropagation();
				table.moveToRowStart();
				return;
			case 'End':
				event.preventDefault();
				event.stopPropagation();
				table.moveToRowEnd();
				return;
			case 'Enter':
			case ' ':
				event.stopPropagation();
				onKeyDownExternal?.(event);
				return;
		}

		onKeyDownExternal?.(event);
	}
</script>

<ButtonRoot
	{...restProps}
	bind:element={buttonRef}
	type="button"
	class={className}
	data-table-sort-trigger="true"
	data-sorted={sortDirection ? 'true' : undefined}
	data-sort-direction={sortDirection}
	onfocus={handleFocus}
	onmousedown={handleMouseDown}
	onclick={handleClick}
	onkeydown={handleKeyDown}
>
	{@render (children as Snippet<[TableSortTriggerRenderState]>)(renderState)}
</ButtonRoot>
