<!-- markdownlint-disable MD024 -->

# Table.Header

## API reference

### Table.Header

Name: `Table.Header`
Description: Header rowgroup for a `Table`, typically containing a single row of sortable or static column headers.

| Prop       | Type      | Default     | Description                          |
| ---------- | --------- | ----------- | ------------------------------------ |
| `class`    | `string`  | `''`        | Class names for the `thead` element. |
| `children` | `Snippet` | `undefined` | Header rows and columns.             |

### Context utilities

Name: `Table.Header` section context
Description: Publishes the `header` section scope for descendant rows and cells.

| Prop                     | Type                        | Default | Description                      |
| ------------------------ | --------------------------- | ------- | -------------------------------- |
| `useTableSectionContext` | `() => TableSectionContext` | `-`     | Reads the current section scope. |
