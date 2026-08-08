---
'@human-kit/ui': patch
---

Fix non-modal popovers refusing to scroll when opened from inside a modal. A `ComboBox` listbox, a `Select` menu or any `Popover.Content` with `modal={false}` is portalled to the body, so it sits outside the dialog that holds the scroll lock — and that lock cancels wheel and touch events everywhere but its own node. The list rendered with a scrollbar that would not move.

Non-modal popover content now registers itself as a live scroll region for as long as it is open, through a new `allowScrollWithin` action. It never takes the lock, so it cannot keep the page frozen on its own.
