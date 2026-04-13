# @human-kit/svelte-components

## 1.0.0-alpha.8

### Patch Changes

- [#22](https://github.com/Agustin-Delgado/svelte-components/pull/22) [`b6cba01`](https://github.com/Agustin-Delgado/svelte-components/commit/b6cba01f4cd8788ad75a4df26f756e277b9ece98) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Summary

  Upgrade `Input` to a focus-aware native input primitive with RAC-style disabled, read-only, invalid, and required state props.

## 1.0.0-alpha.7

### Patch Changes

- [#20](https://github.com/Agustin-Delgado/svelte-components/pull/20) [`896bbf0`](https://github.com/Agustin-Delgado/svelte-components/commit/896bbf0c020c419e1f5a8e543caf9201db912c9e) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Summary

  Add a new headless `Button` component with modality-aware focus state, pressed and hovered data attributes, and RAC-style pending semantics.

## 1.0.0-alpha.6

### Patch Changes

- [#18](https://github.com/Agustin-Delgado/svelte-components/pull/18) [`6197af7`](https://github.com/Agustin-Delgado/svelte-components/commit/6197af7d4289fee17ce8681bb5548784c26f7717) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix published package entrypoints so generated ESM files no longer import sibling TypeScript source paths.

## 1.0.0-alpha.5

### Minor Changes

- [#16](https://github.com/Agustin-Delgado/svelte-components/pull/16) [`fa904e3`](https://github.com/Agustin-Delgado/svelte-components/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add `Table.Checkbox` and `Table.CheckboxIndicator` for explicit row selection controls in body cells and select-all behavior in header cells, including keyboard navigation integration with the table grid.

  Add `hiddenColumns` (bindable) and `defaultHiddenColumns` props to `Table.Root` for controlled and uncontrolled column visibility. Hidden columns are excluded from grid navigation, visible column counts (`aria-colcount`), and resize interactions while preserving their registered widths.

  Add `aria-colindex` to header and body cells for accurate screen reader column position announcements.

- [#16](https://github.com/Agustin-Delgado/svelte-components/pull/16) [`fa904e3`](https://github.com/Agustin-Delgado/svelte-components/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Table Column Resizing

  Add column resizing support to `Table`.
  - add `Table.ColumnResizer` as a public part
  - add column width and resize APIs to `Table.Root` and `Table.Column`
  - render managed column widths through `colgroup`
  - document and demo resizable table columns

- [#16](https://github.com/Agustin-Delgado/svelte-components/pull/16) [`fa904e3`](https://github.com/Agustin-Delgado/svelte-components/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add a new `Table` component with composable parts, grid-style keyboard navigation, row selection, sorting support, docs, and tests.

- [#16](https://github.com/Agustin-Delgado/svelte-components/pull/16) [`fa904e3`](https://github.com/Agustin-Delgado/svelte-components/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add a new headless Checkbox component with Root and Indicator parts.
  - Add tri-state checkbox behavior with checked and indeterminate bindings.
  - Sync a hidden native input for form submission and label targeting.
  - Export Checkbox from the root library entrypoint and package subpath exports.
  - Add baseline docs and browser tests for checkbox interaction.

### Patch Changes

- [#16](https://github.com/Agustin-Delgado/svelte-components/pull/16) [`fa904e3`](https://github.com/Agustin-Delgado/svelte-components/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Update `Table.ColumnResizer` keyboard interaction to use an explicit Enter-to-resize mode.
  - Focused resize handles now enter keyboard resize mode with `Enter` and exit with `Enter`.
  - `Escape` cancels keyboard resizing, restores the starting width, and returns focus to the header cell.
  - Update table docs, demo styling, and tests to reflect the new focus and resize flow.

- [#16](https://github.com/Agustin-Delgado/svelte-components/pull/16) [`fa904e3`](https://github.com/Agustin-Delgado/svelte-components/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix table column resizing so keyboard interactions use the same resize lifecycle as pointer input, add Pointer Events support for touch and pen resizing, announce committed width changes to screen readers, respect RTL keyboard controls, support cancelling pointer drags with Escape, and reduce resize overhead with cached column lookups plus animation-frame batched drag updates. Also make table cell and header column indices react correctly when keyed column order changes and replace module-level table instance counters with per-root token generation to avoid shared SSR and test state.

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
