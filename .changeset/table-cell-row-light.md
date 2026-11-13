---
'@human-kit/ui': patch
---

Make `Table.Cell` and `Table.Row` cheaper. `Table.Root` now listens one time for double clicks. Before, each body cell added its own `dblclick` listener. All rows of a table now share one `MutationObserver`. Before, each body row created its own. A cell that is not pinned no longer reads the column widths. A column drag does not ask it again at each move. A column drag that has no width to freeze no longer measures all headers at each move. A `Table.Body` with `recycle` keeps its window at one length, so the rows that leave one edge are the rows that enter the other.
