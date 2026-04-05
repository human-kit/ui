<!-- markdownlint-disable MD024 MD060 -->

# Table.ColumnResizer

## API reference

### Table.ColumnResizer

Name: `Table.ColumnResizer`
Description: Interactive resize handle for the current `Table.Column`. It must be composed inside `Table.ColumnHeaderCell`, and it resizes the column that owns the surrounding `Table.Column` context.

| Prop        | Type      | Default     | Description                                                          |
| ----------- | --------- | ----------- | -------------------------------------------------------------------- |
| `step`      | `number`  | `16`        | Keyboard resize delta in px for `ArrowLeft` / `ArrowRight`.          |
| `shiftStep` | `number`  | `48`        | Larger keyboard resize delta in px for `Shift+ArrowLeft/ArrowRight`. |
| `class`     | `string`  | `''`        | Class names for the resize handle element.                           |
| `children`  | `Snippet` | `undefined` | Optional custom resize affordance content.                           |

## Usage notes

- `Table.ColumnResizer` must be used inside `Table.ColumnHeaderCell`.
- The parent `Table.Column` must opt in with `allowsResizing`.
- The handle resolves the active column from `Table.Column` context. It does not accept a separate `columnId` prop.
- Width state lives in `Table.Root` through `columnWidths` / `defaultColumnWidths`.
- Pointer resizing uses Pointer Events, so mouse, touch, and pen interactions share the same behavior.
- Keyboard resizing uses the same resize lifecycle callbacks as pointer resizing and announces committed widths through a polite live region.
- Pressing `Enter` on a focused resize handle auto-fits the column to its content width (keyboard equivalent of double-click).
- During pointer drag, pressing `Escape` restores the starting width and cancels the resize interaction.
- In RTL layouts, `ArrowLeft` and `ArrowRight` are inverted so the logical resize direction matches the visual layout.
