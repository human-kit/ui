export * as Table from './index.parts.js';

export type {
	CellContext,
	CellProps,
	CellRenderer,
	ColumnDef,
	Row,
	RowData,
	TableBodyProps,
	TableBodyVirtualizer,
	TableCellProps,
	TableCheckboxIndicatorProps,
	TableCheckboxProps,
	TableColumnHeaderCellProps,
	TableColumnProps,
	TableColumnResizerProps,
	TableSortTriggerRenderState,
	TableSortTriggerProps,
	TableInteractiveCellProps,
	TableEmptyStateProps,
	TableFooterProps,
	TableHeaderProps,
	TableRowProps,
	TableRootProps
} from './types.js';

export { default as TableRoot } from './root/table-root.svelte';
export { default as TableColumn } from './column/table-column.svelte';
export { default as TableHeader } from './header/table-header.svelte';
export { default as TableBody } from './body/table-body.svelte';
export { default as TableEmptyState } from './empty-state/table-empty-state.svelte';
export { default as TableFooter } from './footer/table-footer.svelte';
export { default as TableRow } from './row/table-row.svelte';
export { default as TableColumnHeaderCell } from './column-header-cell/table-column-header-cell.svelte';
export { default as TableSortTrigger } from './sort-trigger/table-sort-trigger.svelte';
export { default as TableColumnResizer } from './column-resizer/table-column-resizer.svelte';
export { default as TableCheckbox } from './checkbox/table-checkbox.svelte';
export { default as TableCheckboxIndicator } from './checkbox-indicator/table-checkbox-indicator.svelte';
export { default as TableCell } from './cell/table-cell.svelte';
export { default as TableInteractiveCell } from './interactive-cell/table-interactive-cell.svelte';

export {
	createTableContext,
	getTableContext,
	setTableContext,
	useTableContext,
	getTableSectionContext,
	setTableSectionContext,
	useTableSectionContext,
	getTableRowContext,
	setTableRowContext,
	useTableRowContext,
	getTableColumnContext,
	setTableColumnContext,
	useTableColumnContext,
	getTableCellContext,
	setTableCellContext,
	useTableCellContext,
	type TableContext,
	type TableRowItem,
	type TableRowFocusEdge,
	type TableDisabledBehavior,
	type TableSelectionBehavior,
	type TableSelectionCheckboxState,
	type TableSelectionKey,
	type TableSelectionMode,
	type TableRowActionHandler,
	type TableSortDirection,
	type TableSortDescriptor,
	type TableColumnWidth,
	type TableColumnPin,
	type TableColumnPinState,
	type TableGridCoord,
	type TableSectionKind,
	type TableSectionContext,
	type TableRowContext,
	type TableColumnContext,
	type TableCellContext,
	type CreateTableContextOptions,
	DEFAULT_TABLE_COLUMN_MIN_WIDTH
} from './root/context.svelte';

export {
	getTableSsrMinWidth,
	type TableColumnWidthSpec,
	type GetTableSsrMinWidthOptions
} from './utils/ssr-min-width.js';

import * as TableParts from './index.parts.js';
export default TableParts;
