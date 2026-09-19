# Avatar TODO

## Goal

Track Avatar work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create the `root`, `image` and `fallback` parts with namespace exports and a shared status.
- [x] [S][P0][Area: State][Owner: Unassigned][Target: Done] Load the image off the screen, show the `<img>` once it is there, and show the fallback at once for a failure or a missing `src`.
- [x] [S][P1][Area: UX][Owner: Unassigned][Target: Done] Hold the fallback back for `delay` milliseconds while the image loads.
- [x] [M][P0][Area: Testing][Owner: Unassigned][Target: Done] Add coverage for the load, the failure, the missing source, the delay, a change of source, `onStatusChange`, and SSR.
- [ ] [S][P2][Area: API][Owner: Unassigned][Target: Backlog] Add an `Avatar.Group` for a row of avatars that overlap, with a count of the rest.
