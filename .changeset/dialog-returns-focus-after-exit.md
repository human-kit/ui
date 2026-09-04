---
'@human-kit/ui': patch
---

Fix the focus return of `Dialog` when the panel has an exit animation.

The animation keeps the content mounted after the close. The `inert` attribute that hides the page from the open dialog is thus still on the trigger, and `focus()` on an inert element does nothing. The focus stayed on the `<body>`, which sent the keyboard user back to the top of the page. `Dialog` now tries again after the update, in the same way as `Drawer`.
