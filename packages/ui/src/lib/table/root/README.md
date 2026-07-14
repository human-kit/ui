<!-- markdownlint-disable MD024 MD060 -->

# Table.Root

## API reference

### Table.Root

Name: `Table.Root`
Description: State container for interactive table behavior, including roving focus, row selection, disabled row handling, and sortable column state.

Public prop type: `TableRootProps`

| Prop                     | Type                                                         | Default     | Description                                                                                                                                          |
| ------------------------ | ------------------------------------------------------------ | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selectionMode`          | `'none' \| 'single' \| 'multiple'`                           | `'none'`    | Controls row selection behavior.                                                                                                                     |
| `selectionBehavior`      | `'toggle' \| 'replace'`                                      | `'toggle'`  | `toggle` uses checkbox-style selection. `replace` makes click replace selection, vertical arrows move selection, and `Shift+ArrowUp/Down` extend it. |
| `disabledBehavior`       | `'selection' \| 'all'`                                       | `'all'`     | Controls whether disabled rows only block selection or block both selection and row actions.                                                         |
| `disallowEmptySelection` | `boolean`                                                    | `false`     | Prevents the internal selection state from becoming empty when selection is enabled.                                                                 |
| `hiddenColumns`          | `Iterable<string>`                                           | `undefined` | Controlled hidden column ids. Supports `bind:hiddenColumns`.                                                                                         |
| `defaultHiddenColumns`   | `Iterable<string>`                                           | `undefined` | Initial hidden column ids for uncontrolled usage.                                                                                                    |
| `selectedKeys`           | `Iterable<string \| number>`                                 | `undefined` | Controlled selected row ids. Supports `bind:selectedKeys`.                                                                                           |
| `defaultSelectedKeys`    | `Iterable<string \| number>`                                 | `undefined` | Initial selected row ids for uncontrolled usage. When `selectionMode` later becomes `none`, the internal selection is cleared.                       |
| `sortDescriptor`         | `{ column: string; direction: 'ascending' \| 'descending' }` | `undefined` | Controlled sort state. Supports `bind:sortDescriptor`. Setting it back to `undefined` clears the sort.                                               |
| `defaultSortDescriptor`  | `{ column: string; direction: 'ascending' \| 'descending' }` | `undefined` | Initial sort state for uncontrolled usage.                                                                                                           |
| `columnWidths`           | `Map<string, TableColumnWidth>`                              | `undefined` | Controlled column width state. Supports px, `%`, and `fr` specs via `bind:columnWidths`.                                                             |
| `defaultColumnWidths`    | `Iterable<[string, TableColumnWidth]>`                       | `undefined` | Initial uncontrolled column widths using px, `%`, or `fr` specs.                                                                                     |
| `disabledKeys`           | `Iterable<string \| number>`                                 | `undefined` | Row ids that should be non-selectable.                                                                                                               |
| `onRowAction`            | `(id: string \| number) => void`                             | `undefined` | Called when a row action is triggered for an actionable row.                                                                                         |
| `onSelectionChange`      | `(keys: Set<string \| number>) => void`                      | `undefined` | Called when row selection changes.                                                                                                                   |
| `onSortChange`           | `(descriptor) => void`                                       | `undefined` | Called when sortable header state changes.                                                                                                           |
| `onColumnWidthsChange`   | `(widths: Map<string, TableColumnWidth>) => void`            | `undefined` | Called when resize interactions update managed column widths.                                                                                        |
| `onHiddenColumnsChange`  | `(columnIds: string[]) => void`                              | `undefined` | Called when hidden column state changes.                                                                                                             |
| `onColumnResizeStart`    | `(columnId: string) => void`                                 | `undefined` | Called when a column resize drag starts.                                                                                                             |
| `onColumnResizeEnd`      | `(widths: Map<string, TableColumnWidth>) => void`            | `undefined` | Called when a column resize drag ends.                                                                                                               |
| `aria-label`             | `string`                                                     | `undefined` | Accessible name when no external label is present.                                                                                                   |
| `aria-labelledby`        | `string`                                                     | `undefined` | Id reference for an external label.                                                                                                                  |
| `class`                  | `string`                                                     | `''`        | Class names for the root table element.                                                                                                              |
| `context`                | `TableContext`                                               | `undefined` | Bindable reference to the active internal table context instance.                                                                                    |
| `element`                | `HTMLTableElement`                                           | `undefined` | Bindable reference to the rendered table element.                                                                                                    |
| `children`               | `Snippet`                                                    | `undefined` | Composed table parts.                                                                                                                                |

### Behavior notes

Name: Selection and sorting notes
Description: Current v1 interaction constraints that affect consumer expectations.

| Topic                   | Behavior                                                                                                                                                                                                                                                                                                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `selectionMode="none"`  | Clears existing row selection internally and prevents further row selection until another mode is set.                                                                                                                                                                                                                                                                                         |
| Text selection and copy | Browser-native text selection and `Ctrl+C` behavior are preserved; the component does not implement custom clipboard logic.                                                                                                                                                                                                                                                                    |
| `replace` mode blur     | Clicking or tabbing outside the table clears focus state but does not clear row selection.                                                                                                                                                                                                                                                                                                     |
| Sort announcements      | Sort changes are mirrored into a polite live region. Use `Table.Column.textValue` when the announced label should differ from the column `id`.                                                                                                                                                                                                                                                 |
| Column resizing         | Width state accepts px, `%`, and `fr` specs. Before interaction, unspecified columns behave like implicit flexible space. On the first real resize, visible columns are converted to px; the trailing column absorbs the delta until its minimum width, and additional growth overflows the table horizontally. A `Table.ColumnResizer` only affects the `Table.Column` it is composed within. |
| Row edge focus          | In body rows, `ArrowLeft` before the first cell and `ArrowRight` after the last cell move focus onto the row itself; `ArrowUp` / `ArrowDown` keep that row-edge focus aligned across rows, repeating the same horizontal arrow loops back into the opposite edge cell, and `Home` / `End` jump to the first or last focusable body row while row focus is active.                              |

### Context utilities

Name: `context.ts` helpers
Description: Internal and advanced APIs for reading and publishing table state.

| Prop                 | Type                        | Default | Description                                             |
| -------------------- | --------------------------- | ------- | ------------------------------------------------------- |
| `createTableContext` | `(options) => TableContext` | `-`     | Creates the internal state contract.                    |
| `setTableContext`    | `(context) => TableContext` | `-`     | Publishes context from `Table.Root`.                    |
| `useTableContext`    | `() => TableContext`        | `-`     | Consumes table context and throws outside `Table.Root`. |
