---
'@human-kit/ui': minor
---

Add the CheckboxGroup primitive with `Root`, `Item` and `Indicator`: one array value for a set of checkboxes, a shared `name` for form submission, group-wide disabled, read-only and required state, `allSelected` and `someSelected` for a parent select-all checkbox, SSR-safe default selection, documentation, and demo coverage. `CheckboxGroup.Item` and `CheckboxGroup.Indicator` are `Checkbox.Root` and `Checkbox.Indicator` under the namespace of the group, so every group in the library reads the same way; a checkbox still works on its own under its own name.
