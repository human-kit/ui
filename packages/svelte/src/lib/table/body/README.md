<!-- markdownlint-disable MD024 -->

# Table.Body

## API reference

### Table.Body

Name: `Table.Body`
Description: Body rowgroup for table data rows. It can render authored rows directly, or render item-driven rows with optional fixed-height virtualization. It also exposes empty-state markers when no logical body rows are available.

Public prop type: `TableBodyProps`

| Prop          | Type                        | Default     | Description                                                                                                                          |
| ------------- | --------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `items`       | `readonly T[]`              | `undefined` | Logical row collection for item-driven mode. When present, `children(item)` renders once per item with `item` inferred from `items`. |
| `virtualizer` | `TableBodyVirtualizer`      | `undefined` | Optional fixed-height row virtualization config with `rowHeight` and optional `overscan` override.                                   |
| `class`       | `string`                    | `''`        | Class names for the `tbody` element.                                                                                                 |
| `children`    | `Snippet` or `Snippet<[T]>` | `undefined` | Manual body content when `items` is omitted, or `children(item)` in item-driven mode.                                                |
| `empty`       | `Snippet`                   | `undefined` | Optional empty-state snippet for item-driven mode.                                                                                   |

### TableBodyVirtualizer

Name: `TableBodyVirtualizer`
Description: Fixed-height body virtualization settings.

| Prop        | Type     | Default | Description                                                                                                                                                          |
| ----------- | -------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `rowHeight` | `number` | `-`     | Required fixed pixel height used to compute the visible range.                                                                                                       |
| `overscan`  | `number` | `18`    | Optional explicit override for the extra rows rendered above and below the viewport. When omitted, the body renders 18 extra rows above and below the visible range. |

### Context utilities

Name: `Table.Body` section context
Description: Publishes the `body` section scope for descendant rows, cells, and empty state.

| Prop                     | Type                        | Default | Description                      |
| ------------------------ | --------------------------- | ------- | -------------------------------- |
| `useTableSectionContext` | `() => TableSectionContext` | `-`     | Reads the current section scope. |
