<!-- markdownlint-disable MD024 MD060 -->

# Table.Column

## API reference

### Table.Column

Name: `Table.Column`
Description: Logical metadata wrapper for a header column. It does not render DOM and is used to register stable column identity, sorting capability, row-header semantics, and resize metadata.

| Prop             | Type                        | Default     | Description                                                                                       |
| ---------------- | --------------------------- | ----------- | ------------------------------------------------------------------------------------------------- |
| `id`             | `string`                    | `-`         | Stable identifier for the column.                                                                 |
| `allowsSorting`  | `boolean`                   | `false`     | Enables sorting for the wrapped header cell.                                                      |
| `allowsResizing` | `boolean`                   | `false`     | Legacy explicit resize opt-in. `Table.ColumnResizer` now enables resizing automatically; keep this only for backward compatibility. |
| `isRowHeader`    | `boolean`                   | `false`     | Marks the associated body column as row-header cells.                                             |
| `textValue`      | `string`                    | `undefined` | Optional spoken label used by `Table.Root` sort announcements when it should differ from `id`.    |
| `width`          | `number \| \`${number}px\`` | `undefined` | Explicit column width hint. Px numbers are the first-class format for the current resize release. |
| `defaultWidth`   | `number \| \`${number}px\`` | `undefined` | Uncontrolled initial width hint for the column.                                                   |
| `minWidth`       | `number`                    | `undefined` | Minimum width in px enforced during resize interactions.                                          |
| `maxWidth`       | `number`                    | `undefined` | Maximum width in px enforced during resize interactions.                                          |
| `children`       | `Snippet`                   | `undefined` | Usually a single `Table.ColumnHeaderCell`.                                                        |

### Context utilities

Name: `Table.Column` column context
Description: Provides column metadata to `Table.ColumnHeaderCell`.

| Prop                    | Type                       | Default | Description                                                          |
| ----------------------- | -------------------------- | ------- | -------------------------------------------------------------------- |
| `useTableColumnContext` | `() => TableColumnContext` | `-`     | Reads the current column metadata and throws outside `Table.Column`. |
