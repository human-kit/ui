---
'@human-kit/ui': minor
---

Add the `SearchField` component with `Root`, `Label`, `Input` and `Clear`. The input is a native `<input type="search">`. The `Escape` key empties the text and stops the key, but an empty field lets the key go on, thus a dialog around the field can close. The `Enter` key calls `onSubmit`, and the form also submits. Keys in an IME composition do neither. The clear button is not in the tab order, keeps the focus in the input, and has a localized name. A form reset puts back `defaultValue`.
