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
		type TableDisabledBehavior,
		type TableRowActionHandler,
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
		disabledBehavior?: TableDisabledBehavior;
		disallowEmptySelection?: boolean;
		hiddenColumns?: Iterable<string>;
		defaultHiddenColumns?: Iterable<string>;
		selectedKeys?: Iterable<TableSelectionKey>;
		defaultSelectedKeys?: Iterable<TableSelectionKey>;
		sortDescriptor?: TableSortDescriptor;
		defaultSortDescriptor?: TableSortDescriptor;
		columnWidths?: Map<string, number>;
		defaultColumnWidths?: Iterable<readonly [string, number]>;
		disabledKeys?: Iterable<TableSelectionKey>;
		onRowAction?: TableRowActionHandler;
		onSelectionChange?: (keys: Set<TableSelectionKey>) => void;
		onSortChange?: (descriptor: TableSortDescriptor | undefined) => void;
		onColumnWidthsChange?: (widths: Map<string, number>) => void;
		onHiddenColumnsChange?: (columnIds: string[]) => void;
		onColumnResizeStart?: (columnId: string) => void;
		onColumnResizeEnd?: (widths: Map<string, number>) => void;
		children?: Snippet;
		class?: string;
		context?: TableContext;
		element?: HTMLTableElement;
	};

	let {
		selectionMode = 'none',
		selectionBehavior = 'toggle',
		disabledBehavior = 'all',
		disallowEmptySelection = false,
		hiddenColumns = $bindable(),
		defaultHiddenColumns,
		selectedKeys = $bindable(),
		defaultSelectedKeys,
		sortDescriptor = $bindable(),
		defaultSortDescriptor,
		columnWidths = $bindable(),
		defaultColumnWidths,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledby,
		disabledKeys,
		onRowAction,
		onSelectionChange,
		onSortChange,
		onColumnWidthsChange,
		onHiddenColumnsChange,
		onColumnResizeStart,
		onColumnResizeEnd,
		children,
		class: className = '',
		context = $bindable(),
		element = $bindable(),
		...restProps
	}: TableRootProps = $props();

	let tableElement = $state<HTMLTableElement | undefined>(undefined);
	let focusWithin = $state(false);
	let focusVisible = $state(false);
	let pendingControlledHiddenColumns = $state<string[] | null>(null);
	let pendingControlledSelection = $state<Set<TableSelectionKey> | null>(null);
	let pendingControlledColumnWidths = $state<Map<string, number> | null>(null);
	let sortAnnouncement = $state('');
	let hasObservedSortState = $state(false);
	let hasInitializedSortSync = $state(false);
	let hasInitializedColumnWidthsSync = $state(false);

	const ctx = setTableContext(
		createTableContext({
			selectionMode: (() => selectionMode)(),
			selectionBehavior: (() => selectionBehavior)(),
			disabledBehavior: (() => disabledBehavior)(),
			disallowEmptySelection: (() => disallowEmptySelection)(),
			initialHiddenColumns: (() => hiddenColumns ?? defaultHiddenColumns)(),
			initialSelectedKeys: (() => selectedKeys ?? defaultSelectedKeys)(),
			initialSortDescriptor: (() => sortDescriptor ?? defaultSortDescriptor)(),
			initialColumnWidths: (() => columnWidths ?? defaultColumnWidths)(),
			disabledKeys: (() => disabledKeys)(),
			onRowAction: (() => onRowAction)(),
			onHiddenColumnsChange: (columnIds) => {
				pendingControlledHiddenColumns = [...columnIds];
				hiddenColumns = [...columnIds];
				onHiddenColumnsChange?.([...columnIds]);
			},
			onSelectionChange: (keys) => {
				pendingControlledSelection = new Set(keys);
				selectedKeys = new Set(keys);
				onSelectionChange?.(new Set(keys));
			},
			onSortChange: (descriptor) => {
				sortDescriptor = descriptor;
				onSortChange?.(descriptor);
			},
			onColumnWidthsChange: (widths) => {
				pendingControlledColumnWidths = new Map(widths);
				columnWidths = new Map(widths);
				// During an active resize drag, skip the external consumer callback
				// to avoid firing it at ~60 fps. The final widths are reported via
				// onColumnResizeEnd. The bindable `columnWidths` is always kept in sync.
				if (!ctx.resizingColumnId) {
					onColumnWidthsChange?.(new Map(widths));
				}
			},
			onColumnResizeStart: (columnId) => {
				onColumnResizeStart?.(columnId);
			},
			onColumnResizeEnd: (widths) => {
				onColumnWidthsChange?.(new Map(widths));
				onColumnResizeEnd?.(new Map(widths));
			}
		})
	);

	function parseSelection(keys: Iterable<TableSelectionKey> | undefined) {
		return new Set<TableSelectionKey>(keys ?? []);
	}

	function parseHiddenColumns(columnIds: Iterable<string> | undefined) {
		return [...new Set(columnIds ?? [])];
	}

	function hasSameSelection(left: Set<TableSelectionKey>, right: Set<TableSelectionKey>) {
		if (left.size !== right.size) return false;
		for (const key of left) {
			if (!right.has(key)) return false;
		}
		return true;
	}

	function hasSameHiddenColumns(left: string[], right: string[]) {
		if (left.length !== right.length) return false;
		const rightSet = new Set(right);
		for (const columnId of left) {
			if (!rightSet.has(columnId)) return false;
		}
		return true;
	}

	function hasSameColumnWidths(left: Map<string, number>, right: Map<string, number>) {
		if (left.size !== right.size) return false;
		for (const [key, value] of left) {
			if (right.get(key) !== value) return false;
		}
		return true;
	}

	const layoutVersion = ctx.layoutVersion;
	const sortVersion = ctx.sortVersion;
	const widthVersion = ctx.widthVersion;
	const ariaColCount = $derived.by(() => {
		void $layoutVersion;
		const columnCount = ctx.getVisibleColumnCount();
		return columnCount > 0 ? columnCount : undefined;
	});
	const ariaRowCount = $derived.by(() => {
		void $layoutVersion;
		const rowCount = ctx.getHeaderRowCount() + ctx.getBodyRowCount();
		return rowCount > 0 ? rowCount : undefined;
	});

	const hasResizable = $derived.by(() => {
		void $layoutVersion;
		return ctx.hasResizableColumns();
	});

	const explicitManagedTableWidth = $derived.by(() => {
		const widths = columnWidths ?? defaultColumnWidths;
		if (!widths) return undefined;

		let total = 0;
		let hasAnyWidth = false;
		for (const [columnId, width] of widths) {
			if (ctx.isColumnHidden(columnId)) continue;
			if (!Number.isFinite(width)) continue;
			total += width;
			hasAnyWidth = true;
		}

		return hasAnyWidth ? total : undefined;
	});

	const managedTableWidth = $derived.by(() => {
		void $widthVersion;
		void $layoutVersion;
		if (!hasResizable) return undefined;
		const widths = ctx.getVisibleColumnWidths();
		const columnCount = ctx.getVisibleColumnCount();
		if (widths.size === 0 || widths.size < columnCount) return undefined;
		let total = 0;
		for (const w of widths.values()) total += w;
		return total;
	});

	const resolvedTableWidth = $derived(managedTableWidth ?? explicitManagedTableWidth);

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
		if (hiddenColumns !== undefined) {
			const nextHiddenColumns = parseHiddenColumns(hiddenColumns);
			if (
				pendingControlledHiddenColumns &&
				hasSameHiddenColumns(pendingControlledHiddenColumns, nextHiddenColumns)
			) {
				pendingControlledHiddenColumns = null;
				return;
			}
			pendingControlledHiddenColumns = null;
			ctx.setHiddenColumns(nextHiddenColumns);
			return;
		}

		ctx.setHiddenColumns(defaultHiddenColumns);
	});

	$effect(() => {
		ctx.setSelectionBehavior(selectionBehavior);
	});

	$effect(() => {
		ctx.setDisabledBehavior(disabledBehavior);
	});

	$effect(() => {
		ctx.setDisallowEmptySelection(disallowEmptySelection);
	});

	$effect(() => {
		ctx.setDisabledKeys(disabledKeys);
	});

	$effect(() => {
		ctx.setRowActionHandler(onRowAction);
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
		if (!hasInitializedColumnWidthsSync) {
			hasInitializedColumnWidthsSync = true;
			if (columnWidths === undefined) {
				return;
			}
		}

		if (columnWidths !== undefined) {
			const nextWidths = new Map(columnWidths);
			if (
				pendingControlledColumnWidths &&
				hasSameColumnWidths(pendingControlledColumnWidths, nextWidths)
			) {
				pendingControlledColumnWidths = null;
				return;
			}
			pendingControlledColumnWidths = null;
			ctx.setColumnWidths(nextWidths);
			return;
		}

		ctx.setColumnWidths(undefined);
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
	style:table-layout={hasResizable || resolvedTableWidth !== undefined ? 'fixed' : undefined}
	style:width={resolvedTableWidth !== undefined ? `${resolvedTableWidth}px` : undefined}
	style:min-width={resolvedTableWidth !== undefined ? '0' : undefined}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledby}
	aria-colcount={ariaColCount}
	aria-rowcount={ariaRowCount}
	aria-multiselectable={selectionMode === 'multiple' ? true : undefined}
	data-selection-mode={selectionMode}
	data-selection-behavior={selectionBehavior}
	data-disabled-behavior={disabledBehavior}
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

<span
	role="status"
	aria-live="polite"
	aria-atomic="true"
	style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
	>{sortAnnouncement}</span
>

<span
	id={ctx.selectionUnavailableDescriptionId}
	style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;"
	>Selection unavailable for this row.</span
>
