<!-- markdownlint-disable MD024 -->

# Table.Body

## API reference

### Table.Body

Name: `Table.Body`
Description: Body rowgroup for table data rows. It also exposes empty-state markers when no body rows are registered.

| Prop       | Type      | Default     | Description                                |
| ---------- | --------- | ----------- | ------------------------------------------ |
| `class`    | `string`  | `''`        | Class names for the `tbody` element.       |
| `children` | `Snippet` | `undefined` | Body rows and optional `Table.EmptyState`. |

### Context utilities

Name: `Table.Body` section context
Description: Publishes the `body` section scope for descendant rows, cells, and empty state.

| Prop                     | Type                        | Default | Description                      |
| ------------------------ | --------------------------- | ------- | -------------------------------- |
| `useTableSectionContext` | `() => TableSectionContext` | `-`     | Reads the current section scope. |
