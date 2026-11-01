---
'@human-kit/ui': patch
---

`Table`: the server renders the column widths that the browser uses after hydration. A `%` or `fr` column, and a column with no width in a table that has resizers, now gets its `minWidth` in px in the server markup. Before, a `%` column took all the remaining width and the last flexible column had no width, and both changed size on hydration. In the browser, a `%` column that the table resolved now gets that width in px, so each column keeps its `minWidth`. Before, the browser divided the remaining width between the `%` columns by their ratio and ignored their `minWidth`.
