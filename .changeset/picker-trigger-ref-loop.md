---
'@human-kit/ui': patch
---

Fix an effect loop in the `DatePicker`, `DateRangePicker`, and `TimePicker` triggers. With Svelte 5.57, the trigger made the error `effect_update_depth_exceeded` when it mounted and when the value changed. Many pickers on one page can then stop the page.
