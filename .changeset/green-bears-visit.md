---
'@human-kit/svelte-components': minor
---

Add table row actions and selection-only disabled behavior.

- add `onRowAction` to `Table.Root` with RAC-style interaction rules across `selectionMode` and `selectionBehavior`
- add `disabledBehavior="selection" | "all"` to split selection disabling from fully disabled rows
- expose actionable and selection-disabled row/cell state through data attributes for styling
- document and demo manual testing flows for toggle-mode actions, replace-mode double click actions, and disabled row behavior
