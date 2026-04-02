<script module lang="ts">
	let warnedMissingAccessibleName = false;

	function warnMissingAccessibleName() {
		if (!import.meta.env.DEV || warnedMissingAccessibleName) return;
		warnedMissingAccessibleName = true;
		console.warn(
			'[Table.Root]: Provide either "aria-label" or "aria-labelledby" so the grid has an accessible name.'
		);
	}
</script>

<script lang="ts">
	import { tick } from 'svelte';
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
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
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
	let pendingControlledSelection = $state<Set<TableSelectionKey> | null>(null);
	let sortAnnouncement = $state('');
	let hasObservedSortState = $state(false);
	let hasInitializedSortSync = $state(false);

	const ctx = setTableContext(
		createTableContext({
			selectionMode: (() => selectionMode)(),
			selectionBehavior: (() => selectionBehavior)(),
			initialSelectedKeys: (() => selectedKeys ?? defaultSelectedKeys)(),
			initialSortDescriptor: (() => sortDescriptor ?? defaultSortDescriptor)(),
			disabledKeys: (() => disabledKeys)(),
			onSelectionChange: (keys) => {
				pendingControlledSelection = new Set(keys);
				selectedKeys = new Set(keys);
				onSelectionChange?.(new Set(keys));
			},
			onSortChange: (descriptor) => {
				sortDescriptor = descriptor;
				onSortChange?.(descriptor);
			}
		})
	);

	function parseSelection(keys: Iterable<TableSelectionKey> | undefined) {
		return new Set<TableSelectionKey>(keys ?? []);
	}

	function hasSameSelection(left: Set<TableSelectionKey>, right: Set<TableSelectionKey>) {
		if (left.size !== right.size) return false;
		for (const key of left) {
			if (!right.has(key)) return false;
		}
		return true;
	}

	const layoutVersion = ctx.layoutVersion;
	const sortVersion = ctx.sortVersion;
	const ariaColCount = $derived.by(() => {
		void $layoutVersion;
		const columnCount = ctx.getColumnCount();
		return columnCount > 0 ? columnCount : undefined;
	});
	const ariaRowCount = $derived.by(() => {
		void $layoutVersion;
		const rowCount = ctx.getHeaderRowCount() + ctx.getBodyRowCount();
		return rowCount > 0 ? rowCount : undefined;
	});

	context = ctx;

	function formatColumnAnnouncementLabel(columnId: string) {
		const normalized = columnId
			.replace(/([a-z0-9])([A-Z])/g, '$1 $2')
			.replace(/[-_]+/g, ' ')
			.trim();
		if (!normalized) return 'Column';
		return normalized.charAt(0).toUpperCase() + normalized.slice(1);
	}

	function getSortAnnouncement(descriptor: TableSortDescriptor | undefined) {
		if (!descriptor) return 'Sorting cleared.';
		const label =
			ctx.getColumnTextValue(descriptor.column)?.trim() ||
			formatColumnAnnouncementLabel(descriptor.column);
		return `${label} sorted ${descriptor.direction}.`;
	}

	async function announceSortChange(descriptor: TableSortDescriptor | undefined) {
		sortAnnouncement = '';
		await tick();
		sortAnnouncement = getSortAnnouncement(descriptor);
	}

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
			const nextSelection = parseSelection(selectedKeys);
			if (
				pendingControlledSelection &&
				hasSameSelection(pendingControlledSelection, nextSelection)
			) {
				pendingControlledSelection = null;
				return;
			}
			pendingControlledSelection = null;
			ctx.setSelection(nextSelection);
		}
	});

	$effect(() => {
		if (!hasInitializedSortSync) {
			hasInitializedSortSync = true;
			if (sortDescriptor === undefined) {
				return;
			}
		}

		ctx.setSortDescriptor(sortDescriptor);
	});

	$effect(() => {
		void $sortVersion;
		const descriptor = ctx.sortDescriptor;
		if (!hasObservedSortState) {
			hasObservedSortState = true;
			return;
		}
		void announceSortChange(descriptor);
	});

	if (import.meta.env.DEV) {
		$effect(() => {
			if (!ariaLabel && !ariaLabelledby) {
				warnMissingAccessibleName();
			}
		});
	}

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
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	aria-colcount={ariaColCount}
	aria-rowcount={ariaRowCount}
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

<span role="status" aria-live="polite" aria-atomic="true" class="sr-only">{sortAnnouncement}</span>
