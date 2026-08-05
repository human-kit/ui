---
'@human-kit/ui': minor
---

Add `TransferList`: two selectable lists with buttons that move items between them. There is one source of truth — `items` is the whole collection and `value` is the ordered list of keys on the right — so `value` is exactly what a form submits, and the right-hand list keeps the order things were moved in.

Both sides are `ListBox`es, so selection, arrow-key navigation, typeahead and virtualization come from there unchanged. Double click moves a row; `Enter` deliberately does not, because in a multi-select listbox it toggles selection. Focus is placed explicitly after every move rather than left to fall on the `<body>`, and `TransferList.Status` announces what moved.

`ListBox` gains **range selection** in `selectionMode="multiple"`: Shift+click, Shift+Arrow and Shift+Home/End select a range from an anchor, and Ctrl/Cmd+click toggles a single option even under `selectionBehavior="replace"`. It also accepts `aria-labelledby`, and now forwards unknown props to its element like every other component.
