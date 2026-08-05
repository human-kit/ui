# Button TODO

## Goal

Track Button work with a single mandatory TODO format.

## Backlog

- [x] [S][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create base `root` part with namespace exports.
- [x] [S][P0][Area: Interaction][Owner: Unassigned][Target: Done] Implement native press, hover, focus, and focus-visible state exposure.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Match RAC-style pending semantics with `aria-disabled`, live announcement, and submit suppression.
- [x] [S][P0][Area: Testing][Owner: Unassigned][Target: Done] Add baseline tests for press, pending, disabled, focus, and form behavior.
- [ ] [S][P1][Area: API][Owner: Unassigned][Target: TBD] Evaluate whether to expose a dedicated `pendingLabel` override if consumers need localized announcement text without custom child content.
- [ ] [S][P1][Area: Accessibility][Owner: Unassigned][Target: TBD] Render the pending live region only while pending. Every button ships one unconditionally, so a widget built from six of them (TransferList) puts seven live regions on the page for announcements that almost never happen.
