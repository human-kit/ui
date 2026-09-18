# Toast TODO

## Goal

Track Toast work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create the `provider`, `viewport`, `root`, `content`, `title`, `description`, `action` and `close` parts, with a manager that holds the list and the timers.
- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Make the viewport a `role="region"` landmark named with the count, with `F6` in and out, and a tab that leaves it back to the previous focus.
- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Announce each toast from two live regions beside the viewport, thus the buttons are not part of the message.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Make each toast a `dialog` or an `alertdialog` that is not modal, named by its title and described by its description.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Stop the timers on hover, on keyboard focus, and in a background window, and give each toast the time it had left on resume.
- [x] [S][P1][Area: State][Owner: Unassigned][Target: Done] Keep the newest toasts up to the limit, and hold the older ones inert with their timers stopped.
- [x] [S][P1][Area: State][Owner: Unassigned][Target: Done] Add `promise` for a loading toast that turns into success or error.
- [x] [M][P1][Area: Interaction][Owner: Unassigned][Target: Done] Dismiss on a swipe that follows the finger, with a threshold and a flick, and never from a button.
- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Keep the viewport reachable behind a modal dialog.
- [x] [M][P0][Area: Testing][Owner: Unassigned][Target: Done] Add coverage for the region, the announcements, the timers, the keyboard, the buttons, the limit, the swipe, the shared manager and SSR.
- [x] [S][P2][Area: API][Owner: Unassigned][Target: Done] Add a `Toast.Positioner` for a toast anchored to an element, such as a button.
- [x] [S][P2][Area: Interaction][Owner: Unassigned][Target: Done] Add a `data-hk-swipe-ignore` note to the docs for content of the consumer that must not start a swipe.
