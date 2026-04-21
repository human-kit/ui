<!-- markdownlint-disable MD024 MD060 -->

# Table.Column

## API reference

### Table.Column

Name: `Table.Column`
Description: Logical metadata wrapper for a header column. It does not render DOM and is used to register stable column identity, sorting capability, row-header semantics, and width constraints.

Public prop type: `TableColumnProps`

| Prop            | Type                        | Default     | Description                                                                                                   |
| --------------- | --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------- |
| `id`            | `string`                    | `-`         | Stable identifier for the column.                                                                             |
| `allowsSorting` | `boolean`                   | `false`     | Enables sorting for the wrapped header cell.                                                                  |
| `isRowHeader`   | `boolean`                   | `false`     | Marks the associated body column as row-header cells.                                                         |
| `textValue`     | `string`                    | `undefined` | Optional spoken label used by `Table.Root` sort announcements when it should differ from `id`.                |
| `width`         | `number \| \`${number}px\`` | `undefined` | Fixed column width. When set, the column keeps that width and user resize interactions are disabled.          |
| `defaultWidth`  | `number \| \`${number}px\`` | `undefined` | Uncontrolled initial width hint for the column. The column remains user-resizable when a resizer is composed. |
| `minWidth`      | `number`                    | `undefined` | Minimum width in px enforced during resize interactions.                                                      |
| `maxWidth`      | `number`                    | `undefined` | Maximum width in px enforced during resize interactions.                                                      |
| `children`      | `Snippet`                   | `undefined` | Usually a single `Table.ColumnHeaderCell`.                                                                    |

`Table.ColumnResizer` is the public resize opt-in. Compose it inside `Table.ColumnHeaderCell` when the owning column should be resizable.

### Context utilities

Name: `Table.Column` column context
Description: Provides column metadata to `Table.ColumnHeaderCell`.

| Prop                    | Type                       | Default | Description                                                          |
| ----------------------- | -------------------------- | ------- | -------------------------------------------------------------------- |
| `useTableColumnContext` | `() => TableColumnContext` | `-`     | Reads the current column metadata and throws outside `Table.Column`. |
