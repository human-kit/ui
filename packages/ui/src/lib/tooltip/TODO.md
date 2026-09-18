# Tooltip TODO

## Goal

Track Tooltip work with a single mandatory TODO format.

## Backlog

- [x] [S][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create the `Root`, `Provider`, `Trigger`, `Content` and `Arrow` parts with namespace exports.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Give the content `role="tooltip"`, and point the trigger at it with `aria-describedby` while it is in the DOM.
- [x] [S][P0][Area: Interaction][Owner: Unassigned][Target: Done] Open on hover after a delay and on keyboard focus at once; close on leave, blur, Escape and press.
- [x] [S][P0][Area: Interaction][Owner: Unassigned][Target: Done] One open tooltip at most, and a skip of the delay soon after a close.
- [ ] [S][P2][Area: Interaction][Owner: Unassigned][Target: TBD] Keep the tooltip open while the pointer crosses the gap in a straight line, without a close delay.
- [ ] [S][P2][Area: Interaction][Owner: Unassigned][Target: TBD] Open on a long press for a touch pointer, behind a prop.
- [ ] [C][P3][Area: Position][Owner: Unassigned][Target: TBD] Follow the pointer along one axis, for a tooltip on a wide element.
