import type { TableColumnProps } from '@human-kit/svelte-components/table';
import type { Component, Snippet } from 'svelte';

export type ColumnDefAlignment = 'left' | 'center' | 'right';

export type ColumnDefValue = string | number | boolean | Date | null | undefined;

export type ColumnSortValue = string | number | boolean | Date | null | undefined;

export type CellRenderContext<T> = {
	item: T;
	value: ColumnDefValue;
	column: ResolvedColumn<T>;
};

type NativeTableColumnProps = Omit<TableColumnProps, 'children' | 'textValue'>;

export type WrapperTableColumnProps<T> = NativeTableColumnProps & {
	header?: string;
	align?: ColumnDefAlignment;
	resizable?: boolean;
	sort?: (item: T) => ColumnSortValue;
	cell?: Snippet<[CellRenderContext<T>]>;
};

export type TableColumnComponent<T> = Component<WrapperTableColumnProps<T>>;

export type TableColumnsContext<T> = {
	Column: TableColumnComponent<T>;
};

export type ResolvedColumn<T> = WrapperTableColumnProps<T>;
