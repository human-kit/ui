---
'@human-kit/ui': minor
---

Add short helper types to the public `table` module for column-driven wrappers and consumer-defined table abstractions.

- export `RowData`, `Row`, `ColumnDef`, `CellContext`, `CellProps`, and `CellRenderer`
- keep these helpers generic so consumers can build any wrapper shape on top of the existing table primitives
