<!-- markdownlint-disable MD024 MD060 -->

# Table.ColumnResizer

## API reference

### Table.ColumnResizer

Name: `Table.ColumnResizer`
Description: Interactive resize handle for the current `Table.Column`. It must be composed inside `Table.ColumnHeaderCell`, and it resizes the column that owns the surrounding `Table.Column` context.

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
- Keyboard resizing uses an explicit resize mode: focus the handle, press `Enter` to capture resize, use `ArrowLeft` / `ArrowRight` (plus `Shift`) to adjust the width, `Home` to jump to the minimum width, and `End` to auto-fit the column to its content width, then press `Enter` again to commit the width and keep focus on the handle.
- While keyboard resize mode is active, pressing `Escape` restores the starting width, exits resize mode, and returns focus to the owning header cell.
- Keyboard resizing uses the same resize lifecycle callbacks as pointer resizing and announces committed widths through a polite live region.
- During pointer drag, pressing `Escape` restores the starting width and cancels the resize interaction.
- Double-click still auto-fits the column to its content width.
- In RTL layouts, `ArrowLeft` and `ArrowRight` are inverted so the logical resize direction matches the visual layout.
