export * as Table from './index.parts.ts';

export { default as TableRoot } from './root/table-root.svelte';
export { default as TableColumn } from './column/table-column.svelte';
export { default as TableHeader } from './header/table-header.svelte';
export { default as TableBody } from './body/table-body.svelte';
export { default as TableEmptyState } from './empty-state/table-empty-state.svelte';
export { default as TableFooter } from './footer/table-footer.svelte';
export { default as TableRow } from './row/table-row.svelte';
export { default as TableColumnHeaderCell } from './column-header-cell/table-column-header-cell.svelte';
export { default as TableColumnResizer } from './column-resizer/table-column-resizer.svelte';
export { default as TableCell } from './cell/table-cell.svelte';

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
	type TableContext,
	type TableSelectionBehavior,
	type TableSelectionKey,
	type TableSelectionMode,
	type TableSortDirection,
	type TableSortDescriptor,
	type TableColumnWidth,
	type TableGridCoord,
	type TableColumnRegistration,
	type TableSectionKind,
	type TableSectionContext,
	type TableRowContext,
	type TableColumnContext,
	type CreateTableContextOptions
} from './root/context';

import * as TableParts from './index.parts.ts';
export default TableParts;
