---
'@human-kit/ui': minor
---

`TransferList` gains filtering, ordering, form submission and a keyboard shortcut:

- **`filter` per side.** A predicate decides what each list shows; the input driving it stays yours. With a filter applied, "move all" means the rows on screen rather than the whole side — moving items the user cannot see would be invisible work.
- **`TransferList.MoveUp` / `MoveDown`.** They shift the right-hand selection one position within `value`, keeping a contiguous block together and disabling at the ends instead of doing nothing quietly. Reordering exists only on the right, where the order is state the user is building.
- **`name` on the Root** renders one hidden input per key, in order, so `value` submits with a form without any wiring.
- **`Ctrl`/`Cmd`+`Enter`** sends the focused list's selection to the other one. Each list has exactly one destination, so the shortcut carries no direction and stays correct in a mirrored layout; each list advertises it with `aria-keyshortcuts`, and `moveShortcut={false}` turns it off.

`onChange` details now carry a `type` of `'move'` or `'reorder'`, plus the `direction` of a reorder, and reorders are announced too — otherwise they are completely silent, since the rows are all still there and only their order changed.

Two accessibility fixes came out of auditing it. The Root renders `role="group"` once it has an `aria-label` or `aria-labelledby`, so the two lists and the buttons reach assistive technology as one control rather than unrelated ones. And a **virtualized `ListBox` now carries `aria-setsize` and `aria-posinset`** on its rows: only a window of options exists in the DOM, so a screen reader was announcing the size of the window — "1 of 8" for a list of two thousand.

`ListBox` also gains `getItemKey`, which lets a Shift range be measured over the whole collection rather than over the options in the DOM: with `virtualizer`, a range now spans rows that were never rendered, and the anchor survives scrolling away. It composes `onkeydown`, `onmousedown`, `onfocusin`, `onfocusout` and `onscroll` with its own handlers instead of letting a consumer's replace them.
