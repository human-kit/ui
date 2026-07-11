---
'@human-kit/svelte-components': minor
---

Refactor TimePicker panel to Apple-like wheel architecture.

- Replace `TimePicker.Column`/`TimePicker.ColumnCell` with `TimePicker.WheelColumn`/`TimePicker.WheelItem`.
- Migrate panel semantics from `listbox/option` to `spinbutton` per wheel column.
- Remove `shouldCloseOnSelect` and `closeOnSelect` from `TimePicker.Root`; wheel selection now commits on snap without auto-close.
- Replace root context column APIs with wheel APIs: `getWheelOptions`, `getSelectedWheelValue`, `selectWheelValue`.
- Update docs and tests for wheel interaction and focus behavior.
