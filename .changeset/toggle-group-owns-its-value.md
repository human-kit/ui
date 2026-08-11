---
'@human-kit/ui': major
---

**Breaking:** remove `ToggleGroup.Root`'s `controlledValue` prop, and stop the group from reporting a selection change while it is unmounting.

- `value` is the source of truth whenever it is supplied, with `bind:value` or without — there is no longer a flag to declare which. `onChange` always fires on a real interaction, and the write-back still reaches a binding.
- A parent that owns `value` and rejects a change still sees the group move; the supplied `value` takes the selection back on the parent's next render.
- Unmounting the whole group no longer fires `onChange`. Previously the selected toggle unregistered during teardown, `disallowEmptySelection` picked a fallback, and the consumer heard a press the user never made — enough to navigate a URL-backed group straight back to the screen being left. Removing a single `Toggle.Root` from a group that stays mounted still falls back and reports.

Migration: delete `controlledValue`. `value` + `onChange` without a binding already is the controlled case.
