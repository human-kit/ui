---
'@human-kit/ui': patch
---

DatePicker, DateRangePicker and TimePicker place their popover against the whole field (the root) instead of the small trigger inside it. Anchored to the button, the panel's edge landed a pixel under the field's bottom border and drew it twice while the panel faded in. `Popover.Content` takes an `anchorRef` for this: the element the panel is placed against, while the trigger keeps the focus and the open state.
