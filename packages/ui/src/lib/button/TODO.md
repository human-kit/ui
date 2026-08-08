# Button TODO

## Goal

Track Button work with a single mandatory TODO format.

## Backlog

- [x] [S][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create base `root` part with namespace exports.
- [x] [S][P0][Area: Interaction][Owner: Unassigned][Target: Done] Implement native press, hover, focus, and focus-visible state exposure.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Match RAC-style pending semantics with `aria-disabled`, live announcement, and submit suppression.
- [x] [S][P0][Area: Testing][Owner: Unassigned][Target: Done] Add baseline tests for press, pending, disabled, focus, and form behavior.
- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Add `focusableWhenDisabled`, which marks the button `aria-disabled` instead of using the native attribute so it keeps its place in the tab order. For controls that are unavailable more often than not, where natively disabling hides the action and shifts the tab order underfoot.
- [ ] [S][P1][Area: API][Owner: Unassigned][Target: TBD] Evaluate whether to expose a dedicated `pendingLabel` override if consumers need localized announcement text without custom child content.
- [ ] [C][P2][Area: Accessibility][Owner: Unassigned][Target: TBD] Consider mounting the pending live region only for buttons that use `pending`. Every button ships one unconditionally, so a widget built from six of them (TransferList) puts seven on the page. Low impact — an empty polite region is not announced — and a naive fix breaks the announcement, since a region has to exist before its content changes.
