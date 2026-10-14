---
'@human-kit/ui': patch
---

A collapsible panel opens to its content's exact size instead of the whole pixels `scrollHeight` rounds to. Content 57.5px tall used to open a 58px panel, half a pixel taller than the same page rendered on the server, so everything under the panel moved when the page hydrated.
