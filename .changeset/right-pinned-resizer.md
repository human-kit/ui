---
'@human-kit/ui': patch
---

`Table.ColumnResizer` on a column pinned to the right now sits on the column's free, inline-start edge, and pulling it towards the start widens the column (pointer and arrow keys alike). On the inline-end edge it was half covered by the next pinned column, or by the table's own edge, and the drag found nothing to grab.
