<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		createTableContext,
		setTableContext,
		type TableContext,
		type TableSelectionBehavior,
		type TableSelectionKey,
		type TableSelectionMode,
		type TableSortDescriptor
	} from './context';
	import {
		shouldShowFocusVisible,
		trackInteractionModality
	} from '../../primitives/input-modality';

	type TableRootProps = Omit<HTMLAttributes<HTMLTableElement>, 'children'> & {
		selectionMode?: TableSelectionMode;
		selectionBehavior?: TableSelectionBehavior;
		selectedKeys?: Iterable<TableSelectionKey>;
		defaultSelectedKeys?: Iterable<TableSelectionKey>;
		sortDescriptor?: TableSortDescriptor;
		defaultSortDescriptor?: TableSortDescriptor;
		disabledKeys?: Iterable<TableSelectionKey>;
		onSelectionChange?: (keys: Set<TableSelectionKey>) => void;
		onSortChange?: (descriptor: TableSortDescriptor | undefined) => void;
		children?: Snippet;
		class?: string;
		context?: TableContext;
		element?: HTMLTableElement;
	};

	let {
		selectionMode = 'none',
		selectionBehavior = 'toggle',
		selectedKeys = $bindable(),
		defaultSelectedKeys,
		sortDescriptor = $bindable(),
		defaultSortDescriptor,
		disabledKeys,
		onSelectionChange,
		onSortChange,
		children,
		class: className = '',
		context = $bindable(),
		element = $bindable(),
		...restProps
	}: TableRootProps = $props();

	let tableElement = $state<HTMLTableElement | undefined>(undefined);
	let focusWithin = $state(false);
	let focusVisible = $state(false);

	function parseSelection(keys: Iterable<TableSelectionKey> | undefined) {
		return new Set<TableSelectionKey>(keys ?? []);
	}

	const ctx = setTableContext(
		createTableContext({
			selectionMode: (() => selectionMode)(),
			selectionBehavior: (() => selectionBehavior)(),
			initialSelectedKeys: (() => selectedKeys ?? defaultSelectedKeys)(),
			initialSortDescriptor: (() => sortDescriptor ?? defaultSortDescriptor)(),
			disabledKeys: (() => disabledKeys)(),
			onSelectionChange: (keys) => {
				selectedKeys = new Set(keys);
				onSelectionChange?.(new Set(keys));
			},
			onSortChange: (descriptor) => {
				sortDescriptor = descriptor;
				onSortChange?.(descriptor);
			}
		})
	);

	context = ctx;

	$effect(() => {
		element = tableElement;
	});

	$effect(() => {
		ctx.setSelectionMode(selectionMode);
	});

	$effect(() => {
		ctx.setSelectionBehavior(selectionBehavior);
	});

	$effect(() => {
		ctx.setDisabledKeys(disabledKeys);
	});

	$effect(() => {
		if (selectedKeys !== undefined) {
			ctx.setSelection(parseSelection(selectedKeys));
		}
	});

	$effect(() => {
		if (sortDescriptor !== undefined) {
			ctx.setSortDescriptor(sortDescriptor);
		}
	});

	function syncFocusWithin() {
		focusWithin =
			!!tableElement && !!document.activeElement && tableElement.contains(document.activeElement);
		if (!focusWithin) {
			focusVisible = false;
			ctx.setFocusedCell(null);
		}
	}

	function handleFocusIn(event: FocusEvent) {
		focusWithin = true;
		focusVisible = shouldShowFocusVisible(event.target as HTMLElement | null);
	}

	function handleFocusOut() {
		queueMicrotask(syncFocusWithin);
	}

	function handleMouseDown(event: MouseEvent) {
		trackInteractionModality(event, event.target as HTMLElement | null);
		focusVisible = false;
	}

	function handleKeyDown(event: KeyboardEvent) {
		trackInteractionModality(event, event.target as HTMLElement | null);
		if (focusWithin) {
			focusVisible = true;
		}
	}
</script>

<table
	bind:this={tableElement}
	role="grid"
	class={className}
	aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
	data-selection-mode={selectionMode}
	data-selection-behavior={selectionBehavior}
	data-focus-within={focusWithin || undefined}
	data-focus-visible={focusVisible || undefined}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	onmousedown={handleMouseDown}
	onkeydown={handleKeyDown}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</table>
