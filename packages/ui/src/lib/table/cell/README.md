<!-- markdownlint-disable MD024 -->

# Table.Cell

## API reference

### Table.Cell

Name: `Table.Cell`
Description: Table data cell part. In body scope it participates in roving focus and row selection. In footer scope it renders semantic summary cells only.

Public prop type: `TableCellProps`

| Prop       | Type      | Default     | Description                                |
| ---------- | --------- | ----------- | ------------------------------------------ |
| `class`    | `string`  | `''`        | Class names for the rendered `td` or `th`. |
| `children` | `Snippet` | `undefined` | Cell content.                              |

### Context utilities

Name: `Table.Cell` dependencies
Description: Consumes row context and table context to derive column semantics and keyboard behavior.

| Prop                 | Type                    | Default | Description                                              |
| -------------------- | ----------------------- | ------- | -------------------------------------------------------- |
| `useTableRowContext` | `() => TableRowContext` | `-`     | Reads row scope and cell order.                          |
| `useTableContext`    | `() => TableContext`    | `-`     | Reads table focus, column metadata, and selection state. |
