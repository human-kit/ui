---
'@human-kit/ui': patch
---

Fix a tooltip that stayed open after the pointer crossed the corner of a rounded panel. While the pointer was in the gap between the trigger and the panel, a move inside the panel's bounding box counted as landing on it, and tracking stopped to let the panel's `pointerenter` take over. The corner of a rounded panel is inside its box but not on it, so that `pointerenter` never came and the tooltip never closed. The gap now asks what the pointer is on, as the browser hit-tests it.
