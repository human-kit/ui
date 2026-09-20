# Slider TODO

## Goal

Track Slider work with a single mandatory TODO format.

## Backlog

- [x] [S][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create the `Root`, `Label`, `Output`, `Track`, `Fill` and `Thumb` parts with namespace exports.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Put a native range input in each thumb, with the ARIA state and the name of the field.
- [x] [S][P0][Area: Keyboard][Owner: Unassigned][Target: Done] Handle the arrows, PageUp, PageDown, Home and End, with the text direction.
- [x] [S][P0][Area: Pointer][Owner: Unassigned][Target: Done] Move the nearest thumb on a press on the track, and drag with pointer capture.
- [x] [S][P0][Area: Forms][Owner: Unassigned][Target: Done] Send the value with the native inputs, and return to the default on a form reset.
- [ ] [S][P2][Area: API][Owner: Unassigned][Target: TBD] Add `Slider.Marks` for the ticks and their labels along the track.
- [ ] [S][P2][Area: API][Owner: Unassigned][Target: TBD] Add a tooltip with the value on the thumb during a drag.
- [ ] [C][P3][Area: Pointer][Owner: Unassigned][Target: TBD] Add a wheel gesture on the focused thumb, behind a prop.
