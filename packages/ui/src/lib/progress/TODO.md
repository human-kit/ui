# Progress TODO

## Goal

Track Progress work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create the `root`, `label`, `track`, `indicator` and `value` parts with namespace exports and a shared context.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Render `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`, and drop the last two while the progress is indeterminate.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Name the bar from `Progress.Label` through `aria-labelledby`, and let an `aria-labelledby` of the caller stand.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Hide `Progress.Value` from the screen reader, which gets the value from the bar.
- [x] [S][P0][Area: State][Owner: Unassigned][Target: Done] Hold a value out of the range at the near end, and read a value that is not a number as indeterminate.
- [x] [S][P1][Area: Formatting][Owner: Unassigned][Target: Done] Format the value as a percentage of the range by default, or in a unit with `format`, in the locale of `LocaleProvider`.
- [x] [S][P1][Area: Layout][Owner: Unassigned][Target: Done] Fill the indicator from the start edge of the text direction, and from the bottom of a vertical track.
- [x] [M][P0][Area: Testing][Owner: Unassigned][Target: Done] Add coverage for the numbers, the states, the label, the value text, the locale, the fill in both orientations and in RTL, and SSR.
- [ ] [S][P2][Area: API][Owner: Unassigned][Target: Backlog] Add a `Meter` primitive for a measurement that is not a task, with `role="meter"`.
- [ ] [S][P2][Area: Accessibility][Owner: Unassigned][Target: Backlog] Add an optional live announcement of milestones for a long task, behind a prop.
