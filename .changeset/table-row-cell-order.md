---
'@human-kit/ui': patch
---

Scrolling a wide virtualized table no longer stalls. A row kept the order of its cells in a `SvelteSet` and a `SvelteMap`, and rewrote the index of every cell after one that left, so a row of fourteen columns leaving the viewport made around a hundred reactive writes. The order now lives in a plain array, read with `indexOf`, and the row's existing epoch announces when a removal moves the cells after it.
