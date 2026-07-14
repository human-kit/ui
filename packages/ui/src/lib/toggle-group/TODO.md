# ToggleGroup TODO

## Accessibility and Logic Audit

- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Avoid firing `onChange` while reconciling initial uncontrolled/default state.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Avoid firing `onChange` while syncing external controlled `value`.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Reject duplicate `Toggle.Root.value` registrations inside a group.
- [x] [M][P0][Area: State][Owner: Unassigned][Target: Done] Normalize `selectionMode="single"` using registration order, not interaction order.
- [x] [M][P0][Area: Interaction][Owner: Unassigned][Target: Done] Scope group keyboard handling to registered toggle buttons only.
- [x] [M][P0][Area: Interaction][Owner: Unassigned][Target: Done] Clear grouped focus state when the focused toggle becomes disabled.
- [x] [M][P0][Area: Testing][Owner: Unassigned][Target: Done] Add regression coverage for mount reconciliation, controlled sync, duplicates, dynamic mode changes, nested controls, and disabled focused toggles.
