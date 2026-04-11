# @human-kit/svelte-components

## 1.0.0-alpha.4

### Minor Changes

- [#13](https://github.com/Agustin-Delgado/svelte-components/pull/13) [`7f2dc3e`](https://github.com/Agustin-Delgado/svelte-components/commit/7f2dc3e198a5a17374d2cad605370b21ebe077fc) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Refactor TimePicker panel to Apple-like wheel architecture.
  - Replace `TimePicker.Column`/`TimePicker.ColumnCell` with `TimePicker.WheelColumn`/`TimePicker.WheelItem`.
  - Migrate panel semantics from `listbox/option` to `spinbutton` per wheel column.
  - Remove `shouldCloseOnSelect` and `closeOnSelect` from `TimePicker.Root`; wheel selection now commits on snap without auto-close.
  - Replace root context column APIs with wheel APIs: `getWheelOptions`, `getSelectedWheelValue`, `selectWheelValue`.
  - Update docs and tests for wheel interaction and focus behavior.

## 1.0.0-alpha.3

### Patch Changes

- [#11](https://github.com/Agustin-Delgado/svelte-components/pull/11) [`9189203`](https://github.com/Agustin-Delgado/svelte-components/commit/918920301f9d9bc34ee80047ff73ccbcd4dbd6c8) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Standardize focus-visible modality behavior across overlay flows.
  - Remove DatePicker local interaction modality state and rely on shared input-modality primitive.
  - Restore DatePicker trigger focus via `focusWithModality` for consistent pointer/keyboard semantics.
  - Unify close-modality resolution between Popover and Dialog through shared primitive helper.
  - Align DatePicker input modality handling with shared focus-visible contract.
  - Expand input-modality tests and document primitive usage in the focus-state contract.

## 1.0.0-alpha.2

### Minor Changes

- [#6](https://github.com/Agustin-Delgado/svelte-components/pull/6) [`9a72432`](https://github.com/Agustin-Delgado/svelte-components/commit/9a72432ef238e79834b07cb42cc22b471c229094) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add the new Calendar component as a public feature release.
  - introduce single and range selection modes
  - add keyboard navigation and accessibility improvements
  - include docs/demo integration and supporting tests

## 1.0.0-alpha.1

### Major Changes

- [#1](https://github.com/Agustin-Delgado/svelte-components/pull/1) [`635fdc1`](https://github.com/Agustin-Delgado/svelte-components/commit/635fdc15efc0349df8d89d4079dda5ba28ff3586) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Initial release of @human-kit/svelte-components
  - ComboBox (single & multi-select with tags, virtual focus, filtering)
  - Dialog (modal with portal, overlay, nested dialogs, focus trap)
  - ListBox (keyboard navigation, single selection)
  - Popover (floating UI positioning, click outside, trigger)
  - Input, Label, Portal primitives
  - Utility primitives (aria-hide-outside, scroll-lock, focus-trap, keyboard-navigation)
