<script lang="ts">
	import type { Snippet } from 'svelte';
	import { onDestroy, onMount } from 'svelte';
	import { useTableCellContext, useTableColumnContext, useTableContext } from '../root/context';
	import type { TableSortTriggerProps, TableSortTriggerRenderState } from '../types.js';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	let { children }: TableSortTriggerProps = $props();

	const table = useTableContext();
	const column = useTableColumnContext();
	const cell = useTableCellContext();
	const sortVersion = table.sortVersion;

	let wrapperRef = $state<HTMLElement | null>(null);
	let activeTrigger = $state<HTMLElement | null>(null);

	const sortDirection = $derived.by(() => {
		void $sortVersion;
		return table.getSortDirection(column.id);
	});
	const renderState = $derived.by<TableSortTriggerRenderState>(() => ({
		sortDirection
	}));

	function getTriggerElement() {
		if (!wrapperRef) return null;
		return wrapperRef.querySelector<HTMLElement>('button, [role="button"]');
	}

	function syncTriggerMetadata(trigger: HTMLElement | null) {
		if (!trigger) return;

		if (trigger instanceof HTMLButtonElement && !trigger.hasAttribute('type')) {
			trigger.type = 'button';
		}

		trigger.setAttribute('data-table-sort-trigger', 'true');
		if (sortDirection) {
			trigger.setAttribute('data-sorted', 'true');
			trigger.setAttribute('data-sort-direction', sortDirection);
		} else {
			trigger.removeAttribute('data-sorted');
			trigger.removeAttribute('data-sort-direction');
		}
	}

	function refreshActiveTrigger() {
		activeTrigger = getTriggerElement();
		syncTriggerMetadata(activeTrigger);
	}

	$effect(() => {
		table.registerColumnSortTrigger(column.token);
		syncTriggerMetadata(activeTrigger);

		return () => {
			table.unregisterColumnSortTrigger(column.token);
		};
	});

	function handleFocusIn(event: FocusEvent) {
		const target = event.target instanceof HTMLElement ? event.target : activeTrigger;
		table.setFocusedCell(cell.cellKey);
		table.setFocusVisible(shouldShowFocusVisible(target ?? null));
	}

	function handleMouseDown(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		const trigger = target?.closest('button, [role="button"]') as HTMLElement | null;
		if (!trigger || !wrapperRef?.contains(trigger)) return;

		trackInteractionModality(event, trigger);
		table.setFocusVisible(false);
		event.stopPropagation();
	}

	function handleClick(event: MouseEvent) {
		const target = event.target as HTMLElement | null;
		const trigger = target?.closest('button, [role="button"]') as HTMLElement | null;
		if (!trigger || !wrapperRef?.contains(trigger)) return;

		activeTrigger = trigger;
		syncTriggerMetadata(activeTrigger);
		event.stopPropagation();
		table.toggleSort(column.id);
	}

	function handleKeyDown(event: KeyboardEvent) {
		const target = event.target as HTMLElement | null;
		const trigger = target?.closest('button, [role="button"]') as HTMLElement | null;
		if (!trigger || !wrapperRef?.contains(trigger)) return;

		activeTrigger = trigger;
		syncTriggerMetadata(activeTrigger);
		trackInteractionModality(event, trigger);

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
				return;
		}
	}

	onMount(() => {
		refreshActiveTrigger();
		wrapperRef?.addEventListener('focusin', handleFocusIn);
		wrapperRef?.addEventListener('mousedown', handleMouseDown);
		wrapperRef?.addEventListener('click', handleClick);
		wrapperRef?.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		wrapperRef?.removeEventListener('focusin', handleFocusIn);
		wrapperRef?.removeEventListener('mousedown', handleMouseDown);
		wrapperRef?.removeEventListener('click', handleClick);
		wrapperRef?.removeEventListener('keydown', handleKeyDown);
	});
</script>

<div bind:this={wrapperRef} style="display: contents;">
	{#if children}
		{@render (children as Snippet<[TableSortTriggerRenderState]>)(renderState)}
	{/if}
</div>
