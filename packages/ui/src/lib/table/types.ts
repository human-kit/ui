import type { Component, Snippet } from 'svelte';
import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type {
	TableColumnPin,
	TableColumnWidth,
	TableContext,
	TableDisabledBehavior,
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
	 * Freezes the column against the horizontal scroll edge: `'left'` sticks it to
	 * the start, `'right'` to the end. Multiple columns can pin to the same side —
	 * they stack in document order and the table computes each one's offset from
	 * the resolved widths of the columns already pinned ahead of it.
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
	 * Width (in px) the table reserves through `min-width` during server
	 * rendering, before its columns have registered their own widths.
	 *
	 * On the server the `<table>` element is serialized before the column
	 * children run their registration, so the table cannot know its own
	 * minimum width yet and renders at the container width. On hydration the
	 * resolved column widths can push the table wider, producing a layout
	 * shift. Set this to the sum of the columns' resolved widths to reserve
	 * that space up-front and avoid the jump. Ignored once the real columns
	 * register on the client.
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
