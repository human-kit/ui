# ToggleGroup TODO

## Accessibility and Logic Audit

- [x] Avoid firing `onChange` while reconciling initial uncontrolled/default state.
- [x] Avoid firing `onChange` while syncing external controlled `value`.
- [x] Reject duplicate `Toggle.Root.value` registrations inside a group.
- [x] Normalize `selectionMode="single"` using registration order, not interaction order.
- [x] Scope group keyboard handling to registered toggle buttons only.
- [x] Clear grouped focus state when the focused toggle becomes disabled.
- [x] Add regression coverage for mount reconciliation, controlled sync, duplicates, dynamic mode changes, nested controls, and disabled focused toggles.
