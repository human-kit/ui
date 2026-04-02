<!-- markdownlint-disable MD024 MD060 -->

# Table.Root

## API reference

### Table.Root

Name: `Table.Root`
Description: State container for interactive table behavior, including roving focus, row selection, disabled row handling, and sortable column state.

| Prop                    | Type                                                         | Default     | Description                                                                            |
| ----------------------- | ------------------------------------------------------------ | ----------- | -------------------------------------------------------------------------------------- |
| `selectionMode`         | `'none' \| 'single' \| 'multiple'`                           | `'none'`    | Controls row selection behavior.                                                       |
| `selectionBehavior`     | `'toggle' \| 'replace'`                                      | `'toggle'`  | `toggle` uses checkbox-style selection. `replace` makes click replace selection, vertical arrows move selection, and `Shift+ArrowUp/Down` extend it. |
| `selectedKeys`          | `Iterable<string \| number>`                                 | `undefined` | Controlled selected row ids. Supports `bind:selectedKeys`.                             |
| `defaultSelectedKeys`   | `Iterable<string \| number>`                                 | `undefined` | Initial selected row ids for uncontrolled usage. When `selectionMode` later becomes `none`, the internal selection is cleared. |
| `sortDescriptor`        | `{ column: string; direction: 'ascending' \| 'descending' }` | `undefined` | Controlled sort state. Supports `bind:sortDescriptor`.                                 |
| `defaultSortDescriptor` | `{ column: string; direction: 'ascending' \| 'descending' }` | `undefined` | Initial sort state for uncontrolled usage.                                             |
| `disabledKeys`          | `Iterable<string \| number>`                                 | `undefined` | Row ids that should be non-selectable.                                                 |
| `onSelectionChange`     | `(keys: Set<string \| number>) => void`                      | `undefined` | Called when row selection changes.                                                     |
| `onSortChange`          | `(descriptor) => void`                                        | `undefined` | Called when sortable header state changes.                                             |
| `aria-label`            | `string`                                                      | `undefined` | Accessible name when no external label is present.                                     |
| `aria-labelledby`       | `string`                                                      | `undefined` | Id reference for an external label.                                                    |
| `class`                 | `string`                                                      | `''`        | Class names for the root table element.                                                |
| `children`              | `Snippet`                                                     | `undefined` | Composed table parts.                                                                  |

### Behavior notes

Name: Selection and sorting notes
Description: Current v1 interaction constraints that affect consumer expectations.

| Topic | Behavior |
| ----- | -------- |
| `selectionMode="none"` | Clears existing row selection internally and prevents further row selection until another mode is set. |
| Text selection and copy | Browser-native text selection and `Ctrl+C` behavior are preserved; the component does not implement custom clipboard logic. |
| `replace` mode blur | Clicking or tabbing outside the table clears focus state but does not clear row selection. |

### Context utilities

Name: `context.ts` helpers
Description: Internal and advanced APIs for reading and publishing table state.

| Prop                 | Type                        | Default | Description                                             |
| -------------------- | --------------------------- | ------- | ------------------------------------------------------- |
| `createTableContext` | `(options) => TableContext` | `-`     | Creates the internal state contract.                    |
| `setTableContext`    | `(context) => TableContext` | `-`     | Publishes context from `Table.Root`.                    |
| `useTableContext`    | `() => TableContext`        | `-`     | Consumes table context and throws outside `Table.Root`. |
