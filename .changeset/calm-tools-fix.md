---
'@human-kit/ui': minor
---

Add new ComboBox trigger and clear parts, plus pending and scroll improvements.

- Add `ComboBox.Trigger` as the primary trigger part while keeping `ComboBox.Button` as a compatibility alias.
- Add `ComboBox.Clear` to reset the input and clear the current selection without stealing focus.
- Reflect `isPending` on trigger and clear affordances while keeping the root as the main async state source.
- Clear the selected value when a single-select combobox input is fully emptied.
- Allow wheel events to stay inside the combobox when a descendant scroll container can continue scrolling.
- Prevent page scroll when neither the popover nor a descendant scroll container can scroll further.
- Forward `Popover.Content` configuration props through `ComboBox.Popover`, including positioning options like `offset`.
- Add docs coverage for pending state and the pattern where overflow is applied to `ComboBox.List` instead of `ComboBox.Popover`.
