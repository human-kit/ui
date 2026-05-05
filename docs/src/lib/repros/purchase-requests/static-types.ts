import type { Component } from 'svelte';
import type { CellContext, CellProps, Row, RowData } from '@human-kit/svelte-components/table';

import type { ColumnDefValue, ResolvedColumn } from './types';

export type StaticRow<T extends RowData> = Row<T>;

export type StaticCellContext<T extends RowData> = Omit<CellContext<T, ColumnDefValue>, 'column'> & {
  column: StaticResolvedColumn<T>;
};

export type StaticResolvedColumn<T extends RowData> = Omit<ResolvedColumn<T>, 'cell'> & {
  cell?: Component<StaticCellComponentProps<T>>;
};

export type StaticCellComponentProps<T extends RowData> = Omit<
  CellProps<T, ColumnDefValue>,
  'column'
> & {
  column: StaticResolvedColumn<T>;
};