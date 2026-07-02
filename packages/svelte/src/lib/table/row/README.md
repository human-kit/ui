<!-- markdownlint-disable MD024 -->

# Table.Row

## API reference

### Table.Row

Name: `Table.Row`
Description: Semantic table row part used in the header, body, or footer. In body scope it reflects row focus, selection, and disabled state.

Public prop type: `TableRowProps`

| Prop         | Type               | Default     | Description                                                     |
| ------------ | ------------------ | ----------- | --------------------------------------------------------------- |
| `id`         | `string \| number` | `undefined` | Stable row identifier used for selection state in `Table.Body`. |
| `disabled` | `boolean`          | `false`     | Marks a body row as non-selectable.                             |
| `textValue`  | `string`           | `undefined` | Reserved for future text-based navigation features.             |
| `class`      | `string`           | `''`        | Class names for the `tr` element.                               |
| `children`   | `Snippet`          | `undefined` | Row cells.                                                      |

### Context utilities

Name: `Table.Row` row context
Description: Publishes row registration and cell-order helpers to descendant cells.

| Prop                 | Type                    | Default | Description                                          |
| -------------------- | ----------------------- | ------- | ---------------------------------------------------- |
| `useTableRowContext` | `() => TableRowContext` | `-`     | Reads the current row token and cell-order contract. |
