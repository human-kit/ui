<!-- markdownlint-disable MD024 MD060 -->

# Table.ColumnResizer

## API reference

### Table.ColumnResizer

Name: `Table.ColumnResizer`
Description: The handle that changes the width of the current `Table.Column`. Put it in a `Table.ColumnHeaderCell`. It changes the width of the column of the `Table.Column` context around it.

Public prop type: `TableColumnResizerProps`

| Prop        | Type      | Default     | Description                                                          |
| ----------- | --------- | ----------- | -------------------------------------------------------------------- |
| `step`      | `number`  | `16`        | Keyboard resize delta in px for `ArrowLeft` / `ArrowRight`.          |
| `shiftStep` | `number`  | `48`        | Larger keyboard resize delta in px for `Shift+ArrowLeft/ArrowRight`. |
| `class`     | `string`  | `''`        | Class names for the resize handle element.                           |
| `children`  | `Snippet` | `undefined` | Optional custom resize affordance content.                           |

## Usage notes

- `Table.ColumnResizer` must be used inside `Table.ColumnHeaderCell`.
- Rendering `Table.ColumnResizer` inside `Table.ColumnHeaderCell` is enough to make the owning `Table.Column` resizable.
- The handle resolves the active column from `Table.Column` context. It does not accept a separate `columnId` prop.
- Width state lives in `Table.Root` through `columnWidths` / `defaultColumnWidths`.
- Pointer resizing uses Pointer Events, so mouse, touch, and pen interactions share the same behavior.
- The keyboard changes the width in a resize mode. Move the focus to the handle and push `Enter` to start that mode. Use the `ArrowLeft` key and the `ArrowRight` key, with `Shift` for a larger step, to change the width. Push `Home` for the minimum width, and `End` for the width of the content. Push `Enter` again to keep the width. The focus stays on the handle.
- While keyboard resize mode is active, pressing `Escape` restores the starting width, exits resize mode, and returns focus to the owning header cell.
- Keyboard resizing uses the same resize lifecycle callbacks as pointer resizing and announces committed widths through a polite live region.
- During pointer drag, pressing `Escape` restores the starting width and cancels the resize interaction.
- Double-click still auto-fits the column to its content width.
- In RTL layouts, `ArrowLeft` and `ArrowRight` are inverted so the logical resize direction matches the visual layout.
