---
'@human-kit/ui': minor
---

Add the PinInput primitive with `Root`, `Label` and `Cell`. Each cell is a real input with its own name, its `inputmode` and its `autocomplete`. A telephone shows the correct keyboard, and a code from a message fills the cells with one touch. A paste goes across the cells from the cell it starts in, and the characters that `type` or `pattern` refuses are dropped. The value has no holes. The characters fill the cells from the first one, and a press on a cell past the first empty one goes to that one. A character that goes away takes the ones after it one cell to the left. `onComplete` runs when the last cell takes a character, `mask` hides the characters, and `name` sends the whole value in a form.
