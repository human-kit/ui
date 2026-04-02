# Table TODO

## Goal

Ship a stable `Table` v1 with keyboard navigation, row selection, sorting, documentation, and reliable accessibility semantics.

## Backlog

- [ ] [M][P1][Area: Accessibility][Owner: Unassigned][Target: TBD] Validate screen reader announcements for `rowheader`, `columnheader`, and `aria-sort` across NVDA and VoiceOver.
- [ ] [M][P1][Area: API][Owner: Unassigned][Target: TBD] Decide whether controlled clearing of `sortDescriptor` should accept `undefined` explicitly or require an additional API.
- [ ] [S][P2][Area: Behavior][Owner: Unassigned][Target: TBD] Confirm whether disabled body rows should remain keyboard-focusable or be skipped by navigation.
- [ ] [S][P2][Area: API][Owner: Unassigned][Target: TBD] Decide whether `Table.Column` should hard-enforce a single `Table.ColumnHeaderCell` child.
- [ ] [C][P2][Area: Docs][Owner: Unassigned][Target: TBD] Add richer styling examples and sorting guidance to the docs page.
