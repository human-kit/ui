# Avatar TODO

## Goal

Track Avatar work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create the `root`, `image` and `fallback` parts with namespace exports and a shared status.
- [x] [S][P0][Area: State][Owner: Unassigned][Target: Done] Load the image off the screen, show the `<img>` once it is there, and show the fallback at once for a failure or a missing `src`.
- [x] [S][P1][Area: UX][Owner: Unassigned][Target: Done] Hold the fallback back for `delay` milliseconds while the image loads.
- [x] [M][P0][Area: Testing][Owner: Unassigned][Target: Done] Add coverage for the load, the failure, the missing source, the delay, a change of source, `onStatusChange`, and SSR.
- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Name the fallback with the `alt` of the image, and hide it for an empty `alt`.
- [x] [S][P2][Area: API][Owner: Unassigned][Target: Done] Add `Avatar.Group` and `Avatar.Count` for a row of avatars with a limit and a count of the rest.
- [x] [S][P2][Area: Performance][Owner: Unassigned][Target: Done] Honor `loading="lazy"`: start the load when the root comes into view, and not on mount.
