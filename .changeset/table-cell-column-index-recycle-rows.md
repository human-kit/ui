---
'@human-kit/ui': minor
---

Table: two new options for a wide table that draws only the cells near the screen.

- `Table.Cell` takes a `columnIndex` prop. Before, a cell found its column from its place among the cells of its row, so a row with a `colspan` filler cell mapped each cell to the wrong column. The prop also skips the scan of the row that each cell did.
- `Table.Body` takes `virtualizer.recycle`. When the window moves, a row that leaves it is given to an item that enters. Before, the body destroyed that row and built another. A cell that keeps its own state must reset it when its item changes.

Both options are off by default, so a table that does not set them does not change.
