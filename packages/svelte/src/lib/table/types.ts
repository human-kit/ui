import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type {
	TableColumnWidth,
	TableContext,
	TableDisabledBehavior,
	TableRowActionHandler,
	TableSelectionBehavior,
	TableSelectionKey,
	TableSelectionMode,
	TableSortDescriptor
} from './root/context.js';

export type TableColumnProps = {
	id: string;
	allowsSorting?: boolean;
	isRowHeader?: boolean;
	textValue?: string;
	width?: TableColumnWidth;
	defaultWidth?: TableColumnWidth;
	minWidth?: number;
	maxWidth?: number;
	children?: Snippet;
};

export type TableHeaderProps = Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> & {
	children?: Snippet;
	class?: string;
};

export type TableBodyProps = Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> & {
	children?: Snippet;
	class?: string;
};

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

export type TableRowProps = Omit<HTMLAttributes<HTMLTableRowElement>, 'children' | 'id'> & {
	id?: TableSelectionKey;
	isDisabled?: boolean;
	textValue?: string;
	children?: Snippet;
	class?: string;
};

export type TableColumnHeaderCellProps = Omit<HTMLAttributes<HTMLTableCellElement>, 'children'> & {
	children?: Snippet;
	class?: string;
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
	keepMounted?: boolean;
	children?: Snippet;
	class?: string;
};
