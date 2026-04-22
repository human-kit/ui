---
'@human-kit/svelte-components': patch
---

Fix `Table` column sizing and ordering edge cases by keeping trailing flexible columns in sync during resize recovery, recomputing relative widths after viewport or container size changes, avoiding one-pixel width loss from relative-column rounding, and updating body cell column indices correctly when keyed columns reorder.
