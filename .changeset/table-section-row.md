---
'@human-kit/ui': minor
---

Add `Table.SectionRow` to show a table in groups. A section row is a full-width header row between the body rows, with one cell that covers all the visible columns. The arrow keys move into it and out of it as on a row. It is not in the selection, it has no checkbox, and it does not call `onRowAction`: a click, `Enter` or `Space` calls its own `onAction`. `Table.Body` gets `isSectionItem`, and the virtualizer gets `sectionRowHeight`, so that a virtualized list knows its section rows and their height.
