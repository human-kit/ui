---
'@human-kit/ui': minor
---

Add the Toast primitive with `Provider`, `Viewport`, `Positioner`, `Root`, `Content`, `Title`, `Description`, `Action` and `Close`. The manager on `useToastManager()` or `bind:manager` has `add`, `update`, `close` and `promise`. The viewport is a `role="region"` landmark named with the count of toasts, with `F6` in and out, and two live regions beside it announce each toast without its buttons. Each toast is a `dialog` that is not modal, or an `alertdialog` for a high priority, with `Escape` to close, a swipe that follows the finger, and an exit animation from its CSS. `Toast.Positioner` puts a toast with an `anchor` against that element. The timers stop on hover, on keyboard focus and in a hidden tab, the newest toasts stay up to a limit, and the viewport stays reachable behind a modal dialog. The `ariaHideOutside` primitive learned `data-hk-hide-outside-exempt`, and the focus trap leaves `Tab` to a surface with that attribute while the focus is in it.
