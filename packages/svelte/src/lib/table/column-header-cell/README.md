<!-- markdownlint-disable MD024 -->

# Table.ColumnHeaderCell

## API reference

### Table.ColumnHeaderCell

Name: `Table.ColumnHeaderCell`
Description: Focusable header cell for a column. It participates in roving focus, exposes `aria-sort` when a nested `Table.SortTrigger` is present, and can host additional header actions.

Public prop type: `TableColumnHeaderCellProps`

- When a nested control like `Table.ColumnResizer` receives focus, the header exposes `data-focus-within` / `data-focus-visible-within` instead of remaining `data-focused`.

| Prop       | Type      | Default     | Description                       |
| ---------- | --------- | ----------- | --------------------------------- |
| `class`    | `string`  | `''`        | Class names for the `th` element. |
| `children` | `Snippet` | `undefined` | Header content.                   |

### Context utilities

Name: `Table.ColumnHeaderCell` dependencies
Description: Consumes both column and row context to register a navigable header cell.

| Prop                    | Type                       | Default | Description                          |
| ----------------------- | -------------------------- | ------- | ------------------------------------ |
| `useTableColumnContext` | `() => TableColumnContext` | `-`     | Reads current column metadata.       |
| `useTableRowContext`    | `() => TableRowContext`    | `-`     | Reads the current row token.         |
| `useTableContext`       | `() => TableContext`       | `-`     | Reads table focus and sorting state. |
