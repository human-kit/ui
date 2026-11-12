---
'@human-kit/ui': patch
---

ListBox: the items share one set of `pointerup`, `pointercancel` and `mouseup` listeners on `window`. Before, each item added its own three listeners. A list of 1000 items ran 3000 handlers at the end of each pointer press, in the whole page. The affected components are ListBox, Select, ComboBox, Autocomplete and any list that uses `ListBox.Item`.
