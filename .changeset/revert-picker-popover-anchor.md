---
'@human-kit/ui': patch
---

Reverts 1.4.2: DatePicker, DateRangePicker and TimePicker place their popover against the trigger again, as in 1.4.1, and `Popover.Content` no longer takes `anchorRef`. The doubled border it was meant to fix came from elsewhere, and the new anchor moved the panel a few pixels.
