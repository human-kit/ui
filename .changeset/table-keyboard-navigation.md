---
'@human-kit/ui': minor
---

Add `keyboardNavigation` to `Table.Root` (`'grid' | 'row' | 'none'`, defaulting to `'grid'`), which decides how far the roving tab stop reaches into the body.

Cell navigation is not free: every body cell registers itself with the focus registry and derives its own focus state, and a virtualized table pays that again for every row it mounts while scrolling. `'row'` keeps the body keyboard-reachable at one focus target per row — arrows walk rows, `Enter` presses one, `Space` toggles its selection — and `'none'` leaves the body inert. In both, focusable content inside a body cell (`Table.Checkbox`, links) becomes a regular tab stop, since no roving focus reaches it any more.

The header keeps its own cell navigation in every mode, so sorting and column resizing stay reachable.
