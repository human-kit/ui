---
'@human-kit/ui': patch
---

fix(menu): a context menu leaves from the point it opened at. Closing dropped the pointer's point at once, so for the frames of its exit animation the menu was placed against its whole surface and flashed somewhere else.
