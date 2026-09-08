# CheckboxGroup TODO

## Goal

Track CheckboxGroup work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create the `root` part with namespace exports and a shared context.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Hold the selection as an array, controlled or uncontrolled, and report it in DOM order.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Let `Checkbox.Root` join the group, and give the group the checked state of every entry.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Keep the value of a checkbox that becomes disabled, and drop the value of one that leaves a live group.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Stop reporting a value change while the group is being torn down.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Reject duplicate `Checkbox.Root.value` registrations inside a group.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Render `role="group"`, and keep one tab stop per checkbox rather than the roving focus of `ToggleGroup`. Checked against the live React Aria example, which gives each checkbox `tabindex="0"`.
- [x] [S][P0][Area: Forms][Owner: Unassigned][Target: Done] Share `name` with every checkbox, and spread group `disabled` and `readonly`.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Keep `required` off the boxes and off `aria-required`, which `role="group"` does not support.
- [x] [S][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Honor the focus state contract, and check it with `test-utils/focus-contract`.
- [x] [S][P1][Area: API][Owner: Unassigned][Target: Done] Report `allSelected` and `someSelected`, and expose `selectAll` and `clearAll` for a parent checkbox.
- [x] [M][P0][Area: Testing][Owner: Unassigned][Target: Done] Add coverage for uncontrolled and controlled value, group state, removal, teardown, tab order, form submission and the parent checkbox.
- [x] [S][P1][Area: API][Owner: Unassigned][Target: Done] Add a `CheckboxGroup.Label` part, so the group names itself without `aria-labelledby` by hand.
- [ ] [M][P1][Area: API][Owner: Unassigned][Target: TBD] Give the parent checkbox a first-class API, the way Base UI does with `allValues` and a `parent` prop, instead of `bind:context` by hand.
- [ ] [C][P2][Area: Forms][Owner: Unassigned][Target: TBD] Enforce a minimum count for `required`, and report it through constraint validation with `aria-describedby`, the way React Aria does.
- [ ] [C][P2][Area: State][Owner: Unassigned][Target: TBD] Restore the group value on form reset from the root, instead of one checkbox at a time.
