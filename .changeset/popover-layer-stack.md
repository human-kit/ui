---
'@human-kit/ui': patch
---

Fix nested popovers dismissing together: add a popover layer stack so only the topmost open popover handles Escape, outside-press, outside-scroll, and focus-out. Closing a nested popover (e.g. a date picker calendar inside a filter popover) no longer closes its ancestors.
