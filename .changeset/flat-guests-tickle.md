---
'@human-kit/ui': patch
---

Update `Table.ColumnResizer` keyboard interaction to use an explicit Enter-to-resize mode.

- Focused resize handles now enter keyboard resize mode with `Enter` and exit with `Enter`.
- `Escape` cancels keyboard resizing, restores the starting width, and returns focus to the header cell.
- Update table docs, demo styling, and tests to reflect the new focus and resize flow.
