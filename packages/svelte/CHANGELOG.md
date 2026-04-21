# @human-kit/svelte-components

## 1.0.0-alpha.17

### Patch Changes

- [#43](https://github.com/Agustin-Delgado/svelte-components/pull/43) [`0faed71`](https://github.com/Agustin-Delgado/svelte-components/commit/0faed71ed19aed40955351bae0159b904f29ba24) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # RAC-style Table Widths

  Add `%` and `fr` support to table width state, and preserve a flexible trailing column during resize so RAC-style resizable tables can keep filling the available width.

- [#43](https://github.com/Agustin-Delgado/svelte-components/pull/43) [`0faed71`](https://github.com/Agustin-Delgado/svelte-components/commit/0faed71ed19aed40955351bae0159b904f29ba24) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Width Contract

  Treat `Table.Column.width` as a fixed width that disables user resizing, while keeping `defaultWidth` as the uncontrolled resizable initial width.

## 1.0.0-alpha.16

### Patch Changes

- [#41](https://github.com/Agustin-Delgado/svelte-components/pull/41) [`74af45c`](https://github.com/Agustin-Delgado/svelte-components/commit/74af45cf6e3809ee508a95abd93282efbcb0f936) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix table accessibility helper nodes so the sort live region and selection-unavailable description stay visually hidden without contributing to page overflow.

## 1.0.0-alpha.15

### Patch Changes

- [#39](https://github.com/Agustin-Delgado/svelte-components/pull/39) [`f4462ff`](https://github.com/Agustin-Delgado/svelte-components/commit/f4462ff4d3556dc8133cb7e90e350fd0e770ea77) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Summary

  Clean up the Table contract by removing the legacy `Table.Column.allowsResizing` prop, exporting explicit public prop types for `Table.Root`, `Table.Column`, `Table.ColumnHeaderCell`, and `Table.ColumnResizer`, and documenting the intended composition model separately from internal normalized column metadata.

## 1.0.0-alpha.14

### Minor Changes

- [#37](https://github.com/Agustin-Delgado/svelte-components/pull/37) [`dbad0a6`](https://github.com/Agustin-Delgado/svelte-components/commit/dbad0a69d654c561793cb81d92ce0149697e2c7b) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add table row actions and selection-only disabled behavior.
  - add `onRowAction` to `Table.Root` with RAC-style interaction rules across `selectionMode` and `selectionBehavior`
  - add `disabledBehavior="selection" | "all"` to split selection disabling from fully disabled rows
  - expose actionable and selection-disabled row/cell state through data attributes for styling
  - document and demo manual testing flows for toggle-mode actions, replace-mode double click actions, and disabled row behavior

## 1.0.0-alpha.13

### Patch Changes

- [#35](https://github.com/Agustin-Delgado/svelte-components/pull/35) [`222642b`](https://github.com/Agustin-Delgado/svelte-components/commit/222642b4f73475d1912598a9724e148d80f73f4a) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix ComboBox and ListBox interaction regressions around input behavior, focus handling, and virtual focus scrolling.

  This disables native browser autocomplete on ComboBox inputs, prevents the reused ListBox root from stealing DOM focus, avoids filtering flashes during popover close animations, and keeps hover-driven virtual focus from auto-scrolling overflowed option lists.

## 1.0.0-alpha.12

### Patch Changes

- [#33](https://github.com/Agustin-Delgado/svelte-components/pull/33) [`b339fe2`](https://github.com/Agustin-Delgado/svelte-components/commit/b339fe278d56040be2e2284c00f7505fe8c3b85c) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix ListBox and ComboBox interaction state issues so keyboard focus, hover, and virtual focus stay in sync.

  This includes clearing item `data-focus-visible` on pointer hover, tightening ListBox focus ownership, skipping disabled ComboBox options during keyboard navigation, and continuing keyboard navigation from the clicked option in multiselect flows.

## 1.0.0-alpha.11

### Minor Changes

- [#31](https://github.com/Agustin-Delgado/svelte-components/pull/31) [`2263415`](https://github.com/Agustin-Delgado/svelte-components/commit/2263415e56ad61747821473a121058e67699a3e8) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add follow-up ComboBox and Popover improvements after the previous prerelease changeset was already consumed.
  - Forward `Popover.Content` configuration props through `ComboBox.Popover`, including positioning options like `offset`, `placement`, `shouldFlip`, `shouldCloseOnEscape`, and `shouldCloseOnBlur`.
  - Ensure `ComboBox` virtual focus marks the active `ListBox.Item` with `data-focus-visible` during keyboard navigation.
  - Keep the interactive ComboBox docs aligned with the shared popover positioning behavior.

## 1.0.0-alpha.10

### Minor Changes

- [#28](https://github.com/Agustin-Delgado/svelte-components/pull/28) [`d6e4d57`](https://github.com/Agustin-Delgado/svelte-components/commit/d6e4d5749198946bbc03651cf53ec8c5af0055da) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add new ComboBox trigger and clear parts, plus pending and scroll improvements.
  - Add `ComboBox.Trigger` as the primary trigger part while keeping `ComboBox.Button` as a compatibility alias.
  - Add `ComboBox.Clear` to reset the input and clear the current selection without stealing focus.
  - Reflect `isPending` on trigger and clear affordances while keeping the root as the main async state source.
  - Clear the selected value when a single-select combobox input is fully emptied.
  - Allow wheel events to stay inside the combobox when a descendant scroll container can continue scrolling.
  - Prevent page scroll when neither the popover nor a descendant scroll container can scroll further.
  - Add docs coverage for pending state and the pattern where overflow is applied to `ComboBox.List` instead of `ComboBox.Popover`.

## 1.0.0-alpha.9

### Patch Changes

- [#25](https://github.com/Agustin-Delgado/svelte-components/pull/25) [`6f70e98`](https://github.com/Agustin-Delgado/svelte-components/commit/6f70e98ae5a9e33a0cbc9ccb44ad285b1db07b91) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Summary

  Make `ComboBox.Input` render through the shared `Input` primitive while preserving existing combobox behavior and accessibility semantics.

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
