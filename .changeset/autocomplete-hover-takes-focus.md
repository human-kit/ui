---
'@human-kit/ui': patch
---

Let the pointer take the virtual focus in `Autocomplete`, the same as in `ComboBox`.

The keys moved the virtual focus and the pointer only marked `data-hovered`, so the row the keys left behind and the row under the pointer were both current at the same time. A style bound to `data-focused` and one bound to `data-hovered` then painted two rows, and an item cannot correct that on its own: it sees only its own attributes. `Autocomplete.Item` now moves the focus to the option the pointer enters, and clears the keyboard ring, so exactly one option is current.
