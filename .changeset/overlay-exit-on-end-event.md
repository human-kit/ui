---
'@human-kit/ui': patch
---

Fix an overlay that closed, showed again for a moment, and closed again. Dialog, Drawer, Popover, Menu, Select, Combobox, Tooltip and Toast end their exit animation on its end event. The end event counted only when the time from the start of the tracking was the full duration, and that time starts a frame after the animation. When that frame was late, the end event did not count and the exit ended on the fallback timer, 50ms or more after the animation. An exit animation without a fill mode, such as `animate-out` of tw-animate-css, then showed the panel at full opacity until it left the DOM. Now the end event counts when no other animation or transition on the element is in progress.
