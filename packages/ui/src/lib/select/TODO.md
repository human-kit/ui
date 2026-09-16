# Select TODO

## Goal

Track Select work with a single mandatory TODO format.

## Backlog

- [x] [M][P0][Area: Architecture][Owner: Unassigned][Target: Done] Create the `root` part with namespace exports and a shared context.
- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Make the trigger a `role="combobox"` button with `aria-haspopup="listbox"`, `aria-expanded` and `aria-controls`.
- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Name the trigger with `Select.Label` and `Select.Value` together.
- [x] [M][P0][Area: Interaction][Owner: Unassigned][Target: Done] Open on `ArrowDown`, `ArrowUp`, `Enter`, `Space`, `Home`, `End` and a printable character, with the focus on the selection.
- [x] [M][P0][Area: Interaction][Owner: Unassigned][Target: Done] Select with `Enter`, `Space` and `Alt+ArrowUp`, close on `Escape` and `Tab`, and move ten options with `PageUp` and `PageDown`.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Hold the value and the open state, controlled or uncontrolled, with `details.cancel()` on `onOpenChange`.
- [x] [M][P0][Area: Forms][Owner: Unassigned][Target: Done] Make a native `<select>` for the form, with `name`, `form`, `required`, `disabled` and `autocomplete`.
- [x] [M][P0][Area: Focus][Owner: Unassigned][Target: Done] Return the focus to the trigger after `Escape` and after a selection, with the modality of the close.
- [x] [S][P1][Area: Selection][Owner: Unassigned][Target: Done] Support `selectionMode="multiple"` with an array value and a popover that stays open.
- [x] [M][P0][Area: Testing][Owner: Unassigned][Target: Done] Add browser and SSR coverage for the ARIA contract, the keyboard, the pointer, the forms and the focus contract.
- [ ] [S][P1][Area: Interaction][Owner: Unassigned][Target: TBD] Place the popover so the selected option sits over the trigger, as Base UI does with `alignItemWithTrigger`.
- [ ] [S][P1][Area: Interaction][Owner: Unassigned][Target: TBD] Change the value with a printable character on the closed trigger, without an open, as a native select does.
- [ ] [C][P2][Area: API][Owner: Unassigned][Target: TBD] Add `Select.Group` and `Select.GroupLabel` for sections in the list.
- [ ] [C][P2][Area: API][Owner: Unassigned][Target: TBD] Add a `Select.Icon` part that shows the open state.
