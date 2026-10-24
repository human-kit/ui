---
'@human-kit/ui': patch
---

Fix: the screen reader live regions of `Button`, `Dropzone` and `TimePicker` wheel columns now use `position: fixed`, not `position: absolute`. An absolute live region inside a scroll container that is not positioned is laid out against an ancestor outside the container. Chrome then puts the sticky content near it, such as a page header, in its own compositing layer, and the text of that content loses subpixel anti-aliasing. All the live regions of the library now use one shared style.
