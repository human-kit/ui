---
'@human-kit/ui': minor
---

Add the Avatar primitive with `Root`, `Image` and `Fallback`. The image loads off the screen first, and the `<img>` renders once it is there, thus a broken image icon never shows. The fallback shows while the image is not on the screen, at once for a failure or a missing `src`, and after `delay` milliseconds while a slow image loads. The root has `data-status` and `onStatusChange` for `loading`, `loaded` and `error`. The fallback takes the name of the image as a `role="img"`, and `loading="lazy"` starts the load when the avatar comes into view. `Avatar.Group` is a named `role="group"` with a `max`, and `Avatar.Count` says how many avatars are past it, as `+N` on the screen and "N more" for the screen reader.
