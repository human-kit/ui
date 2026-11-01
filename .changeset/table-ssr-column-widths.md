---
'@human-kit/ui': patch
---

`Table`: the server renders the column widths that the browser uses after hydration. A `%` or `fr` column, and a column with no width in a table that has resizers, now gets its `minWidth` in px in the server markup. Before, a `%` column took all the remaining width and the last flexible column had no width, and both changed size on hydration.
