---
'@human-kit/ui': minor
---

Add `ToggleGroup.Item`, which is `Toggle.Root` under the namespace of the group. Every group in the library now reads the same way — `Group.Root` with `Group.Item` inside — and `Toggle.Root` keeps working on its own and inside a group, so nothing that is already written changes.

The props of `Toggle.Root` also move from `api.json` into JSDoc, so the reference of the toggle and the reference of the group both read them from one place.
