---
'@human-kit/ui': minor
---

Add the Avatar primitive with `Root`, `Image` and `Fallback`. The image loads off the screen first, and the `<img>` renders once it is there, thus a broken image icon never shows. The fallback shows while the image is not on the screen, at once for a failure or a missing `src`, and after `delay` milliseconds while a slow image loads. The root has `data-status` and `onStatusChange` for `loading`, `loaded` and `error`.
