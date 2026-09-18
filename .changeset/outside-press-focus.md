---
'@human-kit/ui': patch
---

After an outside press on nothing focusable, Popover, Menu, DatePicker and Select return the focus to the trigger, with no focus ring. The focus fell to the body before, and a keyboard user had nowhere to continue from. A press on a focusable element keeps the focus there, and the trigger no longer shows a `data-focused` it does not have.
