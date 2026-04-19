<!-- markdownlint-disable MD024 -->

# Table.EmptyState

## API reference

### Table.EmptyState

Name: `Table.EmptyState`
Description: Convenience part for rendering a semantic empty row inside `Table.Body` when no data rows are registered.

Public prop type: `TableEmptyStateProps`

| Prop       | Type      | Default     | Description                                             |
| ---------- | --------- | ----------- | ------------------------------------------------------- |
| `class`    | `string`  | `''`        | Class names for the generated empty row.                |
| `children` | `Snippet` | `undefined` | Empty-state content rendered inside the generated cell. |

### Context utilities

Name: `Table.EmptyState` body context
Description: Reads body scope and table column count to generate a valid empty row.

| Prop                     | Type                        | Default | Description                                   |
| ------------------------ | --------------------------- | ------- | --------------------------------------------- |
| `useTableContext`        | `() => TableContext`        | `-`     | Reads the current table state.                |
| `useTableSectionContext` | `() => TableSectionContext` | `-`     | Ensures the part is used inside `Table.Body`. |
