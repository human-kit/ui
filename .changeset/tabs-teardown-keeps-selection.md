---
'@human-kit/ui': patch
---

Tabs no longer report a change of selection while the whole strip is being taken off the page. Each tab torn down handed the selection to the next one, the last one to `null`, so a page that writes the bound tab into its URL navigated back to itself when it was left. A single tab removed while the strip stays still hands the selection on.
