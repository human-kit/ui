---
'@human-kit/ui': patch
---

Fix the wheel inside a modal popover, and let the browser zoom again.

`Popover.Content` puts two actions on one element: `scrollLock` while it is modal, and `allowScrollWithin` while it is not. The disabled action removed the registration that the enabled one had just made. The panel thus held the scroll lock with no live scroll region of its own, and every wheel event inside it was cancelled. The `TimePicker` wheels did not turn, and no list in a modal popover could scroll. The registry now counts the registrations, so an action releases only what it took.

A wheel with the `Ctrl` key also goes through now. That gesture is the browser zoom, not a scroll, and cancelling it took page zoom away from the user for as long as an overlay was open.
