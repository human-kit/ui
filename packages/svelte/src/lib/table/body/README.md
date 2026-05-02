<!-- markdownlint-disable MD024 -->

# Table.Body

## API reference

### Table.Body

Name: `Table.Body`
Description: Body rowgroup for table data rows. It can render authored rows directly, or render item-driven rows with optional fixed-height virtualization. It also exposes empty-state markers when no logical body rows are available.

Public prop type: `TableBodyProps`

| Prop          | Type                       | Default     | Description                                                                  |
| ------------- | -------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `items`       | `T[]`                      | `undefined` | Optional logical row collection. When present, `children` renders once per item. |
| `virtualizer` | `TableBodyVirtualizer`     | `undefined` | Optional fixed-height row virtualization config with `rowHeight` and `overscan`. |
| `class`       | `string`                   | `''`        | Class names for the `tbody` element.                                         |
| `children`    | `Snippet` or `Snippet<[T]>` | `undefined` | Manual body content, or the row-render snippet when `items` is provided.     |
| `empty`       | `Snippet`                  | `undefined` | Optional empty-state snippet for item-driven mode.                           |

### TableBodyVirtualizer

Name: `TableBodyVirtualizer`
Description: Fixed-height body virtualization settings.

| Prop        | Type     | Default | Description                                                    |
| ----------- | -------- | ------- | -------------------------------------------------------------- |
| `rowHeight` | `number` | `-`     | Required fixed pixel height used to compute the visible range. |
| `overscan`  | `number` | `6`     | Extra rows rendered above and below the viewport.              |

### Context utilities

Name: `Table.Body` section context
Description: Publishes the `body` section scope for descendant rows, cells, and empty state.

| Prop                     | Type                        | Default | Description                      |
| ------------------------ | --------------------------- | ------- | -------------------------------- |
| `useTableSectionContext` | `() => TableSectionContext` | `-`     | Reads the current section scope. |
