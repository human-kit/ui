---
'@human-kit/svelte-components': minor
---

Add `Table.Checkbox` and `Table.CheckboxIndicator` for explicit row selection controls in body cells and select-all behavior in header cells, including keyboard navigation integration with the table grid.

Add `hiddenColumns` (bindable) and `defaultHiddenColumns` props to `Table.Root` for controlled and uncontrolled column visibility. Hidden columns are excluded from grid navigation, visible column counts (`aria-colcount`), and resize interactions while preserving their registered widths.

Add `aria-colindex` to header and body cells for accurate screen reader column position announcements.
