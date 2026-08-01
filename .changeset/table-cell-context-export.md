---
'@human-kit/ui': patch
---

Export the table cell context, `TableRowItem` and `TableRowFocusEdge` from `@human-kit/ui/table`.

`useTableCellContext` (and its `get`/`set` pair, plus the `TableCellContext` type) were defined
alongside the table, row and column contexts but left out of the subpath's barrel. Every other
level of the grid was reachable; the cell was the one that forced consumers to deep-import
`table/root/context.svelte.js`, a path outside the package's `exports` map — so it typechecked
only against the source, never against the published package.

Two type-level gaps of the same kind are closed with it. `TableRowItem` is the constraint on the
already-exported `TableBodyProps<T extends TableRowItem>`, and `TableRowFocusEdge` is the second
parameter of `focusRowByToken` and `setFocusedRow` on the already-exported `TableContext`. Both
were unnameable from outside the package, which made the surfaces that use them impossible to
annotate or wrap.
