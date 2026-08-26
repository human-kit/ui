import type { Component, Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type {
	TableColumnPin,
	TableColumnWidth,
	TableContext,
	TableDisabledBehavior,
	TableKeyboardNavigation,
	TableRowActionHandler,
	TableRowItem,
	TableSelectionBehavior,
	TableSelectionKey,
	TableSelectionMode,
	TableSortDirection,
	TableSortDescriptor
} from './root/context.svelte';

export type { TableColumnPin } from './root/context.svelte';

export type TableColumnProps = {
	id: string;
	rowHeader?: boolean;
	textValue?: string;
	width?: TableColumnWidth;
	defaultWidth?: TableColumnWidth;
	minWidth?: number;
	maxWidth?: number;
	/**
	 * Keeps the column at an edge of the horizontal scroll: `'left'` at the start, and `'right'` at
	 * the end. More than one column can go to the same side. They go in the sequence of the document.
	 * The table calculates the position of each one from the widths of the columns already at that
	 * side.
	 */
	pin?: TableColumnPin;
	children?: Snippet;
};

export type RowData = Record<string, unknown> & {
	id: TableSelectionKey;
};

export type Row<T extends RowData = RowData> = {
	id: T['id'];
	original: T;
};

export type ColumnDef<T extends RowData = RowData, TValue = unknown> = {
	id: string;
	header?: string;
	textValue?: string;
	accessorKey?: Extract<keyof T, string>;
	accessor?: (row: T) => TValue;
	sortValue?: (row: T) => string | number | boolean | Date | null | undefined;
	align?: 'left' | 'center' | 'right';
	rowHeader?: boolean;
	resizable?: boolean;
	width?: TableColumnWidth;
	defaultWidth?: TableColumnWidth;
	minWidth?: number;
	maxWidth?: number;
	pin?: TableColumnPin;
	cellComponent?: Component<CellProps<T, TValue>>;
	renderCell?: CellRenderer<T, TValue>;
};

export type CellContext<T extends RowData = RowData, TValue = unknown> = {
	row: Row<T>;
	value: TValue;
	column: ColumnDef<T, TValue>;
};

export type CellProps<T extends RowData = RowData, TValue = unknown> = CellContext<T, TValue>;

export type CellRenderer<T extends RowData = RowData, TValue = unknown> = Snippet<
	[CellContext<T, TValue>]
>;

export type TableHeaderProps = Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> & {
	children?: Snippet;
	class?: string;
};

export type TableBodyVirtualizer = {
	rowHeight: number;
	/**
	 * Extra rows rendered above and below the viewport, defaulting to 18. It
	 * buffers against row render cost: while the main thread builds rows, the
	 * compositor keeps scrolling, and anything past the last rendered row shows
	 * as blank. Raise it for expensive rows or very fast scrolling.
	 */
	overscan?: number;
};

type TableBodyBaseProps = Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> & {
	class?: string;
};

export type TableBodyManualProps = TableBodyBaseProps & {
	items?: undefined;
	virtualizer?: undefined;
	children?: Snippet;
	empty?: undefined;
};

export type TableBodyItemsProps<T extends TableRowItem = TableRowItem> = TableBodyBaseProps & {
	items: readonly T[];
	virtualizer?: TableBodyVirtualizer;
	children?: Snippet<[T]>;
	empty?: Snippet;
};

export type TableBodyProps<T extends TableRowItem = TableRowItem> =
	TableBodyManualProps | TableBodyItemsProps<T>;

export type TableFooterProps = Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> & {
	children?: Snippet;
	class?: string;
};

export type TableRootProps = Omit<HTMLAttributes<HTMLTableElement>, 'children'> & {
	selectionMode?: TableSelectionMode;
	/**
	 * How far the roving tab stop goes into the body. The default is `'grid'`.
	 *
	 * The cell navigation has a cost. Each body cell registers itself and calculates its own focus
	 * state. A virtualized table does this again for each block of rows that it makes while the user
	 * scrolls.
	 *
	 * With `'row'`, the keyboard still reaches the body, at one focus target for each row. With
	 * `'none'`, the body takes no focus. Use `'none'` only when nothing in the body does an action.
	 * In each mode, the header keeps its own navigation, and with it the sort control and the width
	 * control.
	 */
	keyboardNavigation?: TableKeyboardNavigation;
	selectionBehavior?: TableSelectionBehavior;
	disabledBehavior?: TableDisabledBehavior;
	disallowEmptySelection?: boolean;
	hiddenColumns?: Iterable<string>;
	defaultHiddenColumns?: Iterable<string>;
	selectedKeys?: Iterable<TableSelectionKey>;
	defaultSelectedKeys?: Iterable<TableSelectionKey>;
	sortDescriptor?: TableSortDescriptor;
	defaultSortDescriptor?: TableSortDescriptor;
	columnWidths?: Map<string, TableColumnWidth>;
	defaultColumnWidths?: Iterable<readonly [string, TableColumnWidth]>;
	/**
	 * The width that the table keeps with `min-width` on the server, in px, before the columns
	 * register their own widths.
	 *
	 * On the server, the `<table>` element goes to the output before the column children register.
	 * Thus the table does not know its own minimum width, and it takes the width of its container. At
	 * the hydration, the column widths can make the table wider, and the layout moves.
	 *
	 * Set this prop to the sum of the column widths to keep that space from the start. On the client,
	 * the component ignores it after the columns register.
	 */
	ssrMinTableWidth?: number;
	disabledKeys?: Iterable<TableSelectionKey>;
	onRowAction?: TableRowActionHandler;
	onSelectionChange?: (keys: Set<TableSelectionKey>) => void;
	onSortChange?: (descriptor: TableSortDescriptor | undefined) => void;
	onColumnWidthsChange?: (widths: Map<string, TableColumnWidth>) => void;
	onHiddenColumnsChange?: (columnIds: string[]) => void;
	onColumnResizeStart?: (columnId: string) => void;
	onColumnResizeEnd?: (widths: Map<string, TableColumnWidth>) => void;
	children?: Snippet;
	class?: string;
	context?: TableContext;
	element?: HTMLTableElement;
};

export type TableRowProps = Omit<HTMLAttributes<HTMLTableRowElement>, 'children' | 'id'> & {
	id?: TableSelectionKey;
	disabled?: boolean;
	textValue?: string;
	children?: Snippet;
	class?: string;
};

export type TableColumnHeaderCellProps = Omit<HTMLAttributes<HTMLTableCellElement>, 'children'> & {
	children?: Snippet;
	class?: string;
};

export type TableSortTriggerRenderState = {
	sortDirection: TableSortDirection | undefined;
};

export type TableSortTriggerProps = Omit<HTMLButtonAttributes, 'children' | 'class' | 'type'> & {
	children?: Snippet<[TableSortTriggerRenderState]> | Snippet;
	class?: string;
	element?: HTMLButtonElement | null;
};

export type TableColumnResizerProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
	step?: number;
	shiftStep?: number;
	children?: Snippet;
	class?: string;
};

export type TableCellProps = Omit<HTMLAttributes<HTMLTableCellElement>, 'children'> & {
	children?: Snippet;
	class?: string;
};

export type TableInteractiveCellProps = TableCellProps;

export type TableEmptyStateProps = {
	children?: Snippet;
	class?: string;
};

export type TableCheckboxProps = Omit<
	HTMLAttributes<HTMLSpanElement>,
	| 'children'
	| 'class'
	| 'id'
	| 'role'
	| 'tabindex'
	| 'aria-checked'
	| 'aria-disabled'
	| 'onclick'
	| 'onkeydown'
> & {
	id?: string;
	title?: string;
	children?: Snippet;
	class?: string;
	'aria-label'?: string;
	'aria-labelledby'?: string;
};

export type TableCheckboxIndicatorProps = Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children' | 'class'
> & {
	forceMount?: boolean;
	children?: Snippet;
	class?: string;
};
