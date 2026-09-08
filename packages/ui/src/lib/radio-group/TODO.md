# RadioGroup TODO

## Goal

Track RadioGroup work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create the `root` part with namespace exports and a shared context.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Hold one value, controlled or uncontrolled, and refuse to unselect it.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Reject duplicate `RadioGroup.Item.value` registrations, and a `RadioGroup.Item` with no group.
- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Render `role="radiogroup"` with `aria-orientation`, `aria-required`, `aria-disabled` and `aria-readonly`.
- [x] [M][P0][Area: Interaction][Owner: Unassigned][Target: Done] Keep one tab stop, on the checked radio, and on the first enabled radio while nothing is checked.
- [x] [M][P0][Area: Interaction][Owner: Unassigned][Target: Done] Move the focus and the selection with the arrow keys, with wrapping, `Home` and `End`, and both axes.
- [x] [S][P0][Area: Interaction][Owner: Unassigned][Target: Done] Select with `Space`, and leave `Enter` to the form.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Keep the value when the selected radio leaves the tree, and move the tab stop instead.
- [x] [S][P0][Area: Forms][Owner: Unassigned][Target: Done] Share `name` and `form` with every radio, and spread group `disabled`, `readonly` and `required`.
- [x] [M][P0][Area: Testing][Owner: Unassigned][Target: Done] Add coverage for the roving tab stop, arrow selection, wrapping, disabled radios, form submission and the focus contract.
- [x] [S][P1][Area: API][Owner: Unassigned][Target: Done] Add a `RadioGroup.Label` part, so the group names itself without `aria-labelledby` by hand.
- [ ] [S][P1][Area: API][Owner: Unassigned][Target: TBD] Add an optional `nativeButton` rendering mode to `RadioGroup.Item`, for sibling-label patterns.
- [ ] [C][P2][Area: Animation][Owner: Unassigned][Target: TBD] Add indicator presence data for enter and exit animations.
- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Adopt `watchFocusVisible`, so a key press after a pointer press brings the ring back.
- [ ] [C][P2][Area: Forms][Owner: Unassigned][Target: TBD] Report the required state through constraint validation with `aria-describedby`.
