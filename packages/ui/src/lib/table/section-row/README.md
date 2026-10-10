<!-- markdownlint-disable MD024 -->

# Table.SectionRow

## API reference

### Table.SectionRow

Name: `Table.SectionRow`
Description: Full-width group header row inside `Table.Body`. It has one cell that covers all the visible columns. It takes the focus as a row, but it is not in the selection and does not call `onRowAction`.

Public prop type: `TableSectionRowProps`

| Prop       | Type               | Default     | Description                                                                 |
| ---------- | ------------------ | ----------- | --------------------------------------------------------------------------- |
| `id`       | `string \| number` | `undefined` | Key of the item. It gives the row its place in the logical rows.            |
| `onAction` | `() => void`       | `undefined` | Called on click, and on `Enter` or `Space` while the section row has focus. |
| `class`    | `string`           | `''`        | Class names for the `tr` element.                                           |
| `children` | `Snippet`          | `undefined` | Content of the single cell.                                                 |

Other attributes, for example `aria-expanded` or `data-*`, go to the `tr` element.

### Data attributes

| Attribute                   | Element    | Description                                  |
| --------------------------- | ---------- | -------------------------------------------- |
| `data-section-row`          | `tr`       | Always set.                                  |
| `data-focused`              | `tr`, `td` | Set on the element that has the focus.       |
| `data-focus-visible`        | `tr`, `td` | Set when that focus comes from the keyboard. |
| `data-focus-within`         | `tr`       | Set when the row or its cell has the focus.  |
| `data-focus-visible-within` | `tr`       | Set when that focus comes from the keyboard. |
