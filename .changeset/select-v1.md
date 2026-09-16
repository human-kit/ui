---
'@human-kit/ui': minor
---

Add the Select primitive with `Root`, `Label`, `Trigger`, `Value`, `Popover`, `List`, `Item` and `ItemIndicator`: a form field with one value from a list of options, or more than one with `selectionMode="multiple"`. The trigger is a `role="combobox"` button named by the label and the value together, the list is a `ListBox` in a popover that takes the focus on the selected option, and a hidden native `<select>` sends the value with the form. It has the keyboard of the WAI-ARIA select-only combobox: the arrows, `Home`, `End`, `PageUp`, `PageDown` and typed characters open the list and move through it, `Enter`, `Space` and `Alt+ArrowUp` select, and `Escape` and `Tab` close. Includes documentation and demo coverage.

The keyboard-navigation primitive gains a `typeahead(char)` method, for a widget that opens on a character typed outside the list.
