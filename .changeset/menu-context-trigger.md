---
'@human-kit/ui': minor
---

Add `Menu.ContextTrigger`, a surface that opens the menu on right click, on long press for touch and pen, and with `Shift+F10` or the `ContextMenu` key. Everything below the trigger — items, groups, submenus, keyboard navigation — is unchanged, so a context menu is the same menu with a different opener.

The panel is anchored at the pointer (and `Menu.Content` drops its default `offset` to `0` for a context menu), or to the surface itself when opened from the keyboard, where no pointer position exists.

Two new primitives back it and are exported for reuse: `createPointAnchor`, which lets any floating panel anchor to a viewport point instead of an element, and the `longPress` action.
