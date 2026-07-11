---
'@human-kit/svelte-components': minor
---

Replace implicit table header sorting with an explicit `Table.SortTrigger` part. `Table.Column` no longer accepts `allowsSorting`; columns become sortable by composing `Table.SortTrigger` inside `Table.ColumnHeaderCell`.

This change prevents nested header actions like filter popovers from triggering sort through click bubbling and lets sortable headers take DOM focus directly through the trigger while keeping the table grid navigation contract.
