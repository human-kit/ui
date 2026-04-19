<!-- markdownlint-disable MD024 -->

# Table.Footer

## API reference

### Table.Footer

Name: `Table.Footer`
Description: Footer rowgroup for summary rows or aggregate information. In v1 it is semantic only and excluded from keyboard navigation.

Public prop type: `TableFooterProps`

| Prop       | Type      | Default     | Description                          |
| ---------- | --------- | ----------- | ------------------------------------ |
| `class`    | `string`  | `''`        | Class names for the `tfoot` element. |
| `children` | `Snippet` | `undefined` | Footer rows.                         |

### Context utilities

Name: `Table.Footer` section context
Description: Publishes the `footer` section scope for descendant rows and cells.

| Prop                     | Type                        | Default | Description                      |
| ------------------------ | --------------------------- | ------- | -------------------------------- |
| `useTableSectionContext` | `() => TableSectionContext` | `-`     | Reads the current section scope. |
