# @human-kit/ui

## 1.0.0-beta.2

### Patch Changes

- [#64](https://github.com/human-kit/ui/pull/64) [`5cf5441`](https://github.com/human-kit/ui/commit/5cf544138842fd0bf3861a1c3be2d1c6bfed0f62) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Export the table cell context, `TableRowItem` and `TableRowFocusEdge` from `@human-kit/ui/table`.

  `useTableCellContext` (and its `get`/`set` pair, plus the `TableCellContext` type) were defined
  alongside the table, row and column contexts but left out of the subpath's barrel. Every other
  level of the grid was reachable; the cell was the one that forced consumers to deep-import
  `table/root/context.svelte.js`, a path outside the package's `exports` map — so it typechecked
  only against the source, never against the published package.

  Two type-level gaps of the same kind are closed with it. `TableRowItem` is the constraint on the
  already-exported `TableBodyProps<T extends TableRowItem>`, and `TableRowFocusEdge` is the second
  parameter of `focusRowByToken` and `setFocusedRow` on the already-exported `TableContext`. Both
  were unnameable from outside the package, which made the surfaces that use them impossible to
  annotate or wrap.

## 1.0.0-beta.1

### Minor Changes

- [#61](https://github.com/human-kit/ui/pull/61) [`2e4778c`](https://github.com/human-kit/ui/commit/2e4778c79da0059dbd48fd36e11aaf961cf1d89f) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add `Drawer`, an edge-anchored panel dismissed by swiping it away.

  - Compose `Drawer.Root`, `Drawer.Trigger`, `Drawer.Portal`, `Drawer.Overlay` and `Drawer.Content`, plus `Drawer.Body` (the scrolling region), `Drawer.Title`, `Drawer.Description` and `Drawer.Close`. `Drawer.Viewport` is an optional positioning layer; without it the panel pins itself to its edge.
  - `side` anchors the panel to any of the four edges. `modal` accepts `true`, `'trap-focus'` (keyboard captured, page still scrollable) or `false`. Drawers register in the same layer stack as `Dialog`, so Escape and outside presses only ever dismiss the topmost layer and z-indexes interleave correctly.
  - Swipe-to-dismiss with velocity-aware release and deference to any scrollable region between the finger and the panel — a sheet with a scrolling body no longer drags itself off screen when you try to scroll it. The panel publishes `--drawer-swipe-movement-x/y`, `--drawer-swipe-progress` and `--drawer-swipe-strength`; appearance stays with the consumer's CSS.
  - `--drawer-swipe-progress` measures progress toward **dismissal**, staying at `0` for the whole trip between snap points. A backdrop tied to raw movement brightened the page while a sheet travelled from one snap point to another and snapped dark again on release, for a drawer that never left.
  - Pulling a drawer further open than it can go stretches it against heavy resistance, capped at 40px and published as `--drawer-overdrag`. The strip of page the panel moves off is covered in the panel's own background, so the drawer never looks like it is coming apart from its edge.
  - Only the drawer at the back of the stack paints a backdrop. Each root brings its own overlay, so stacking two dimmed the page twice — darkening the drawer underneath along with everything else. The ones above get `data-nested` on their overlay and stand down.
  - `data-starting-style` marks the first painted frame after the panel mounts, giving a CSS transition a value to animate from. Without it a drawer built on `transition` has an exit animation and no entrance.
  - `snapPoints` / `snapPoint` / `defaultSnapPoint` / `onSnapPointChange` / `snapToSequentialPoints`, resolved from fractions, pixels or CSS lengths, with releases settling on the point the flick was heading for. Exposed through `--drawer-snap-point-offset` and `data-expanded`.
  - Nested drawers expose `data-nested-drawer-open`, `data-nested-drawer-swiping`, `--nested-drawers` and `--drawer-frontmost-height`; `Drawer.Indent` and `Drawer.IndentBackground` let the app behind pull back with the gesture.
  - `Drawer.SwipeArea` opens the drawer from a viewport edge with the panel following the finger, and `Drawer.VirtualKeyboardProvider` publishes `--drawer-keyboard-inset` so a bottom sheet's footer clears the software keyboard.
  - `createDrawerHandle()` drives a drawer from triggers anywhere in the tree, passing a `payload` to the root's `children` snippet and returning focus to the trigger that actually opened it.

  Add `Dialog.Title`, `Dialog.Description` and `Dialog.Close`.

  `Dialog.Title` and `Dialog.Description` register their ids and wire `aria-labelledby` / `aria-describedby` on `Dialog.Content`. A `role="dialog"` takes its name from `aria-labelledby`, never from the text inside it, so a dialog built with a bare heading had no accessible name. The new parts are additive — existing dialogs are unchanged.

  Move the layer z-index math from `dialog/root/dialog-stack.ts` into `primitives/layer-stack.ts`, so `Menu` and `Popover` no longer import from `Dialog` to place themselves. The public helpers keep their names and values.

## 1.0.0-beta.0

### Minor Changes

- [`e197413`](https://github.com/human-kit/ui/commit/e197413f9c398fdf9c489f92f6490b3d7be09b0b) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Promote the library to its first public beta, exiting the alpha prerelease line.

## 1.0.0-alpha.22

### Minor Changes

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add the new `Toggle` primitive with a single `Root` part.
  - support controlled and uncontrolled selected state with `selected`, `defaultSelected`, and `onChange`
  - expose native button semantics with `aria-pressed`, disabled behavior, and keyboard activation
  - add styling hooks for selected, unselected, pressed, hover, focus, and focus-visible states
  - expose the `./toggle` package entry and add docs/demo coverage

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add a `filter` prop to `ComboBox.Root` so consumers can customize local option filtering or pass `null` to disable it for externally filtered lists.

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add the new `Tabs` primitive with `Root`, `List`, `Tab`, `Indicator`, and `Panel` parts.
  - support controlled and uncontrolled selection, including `null` values
  - add automatic and manual keyboard activation with horizontal and vertical roving focus
  - include accessible tab and tabpanel wiring, SSR-ready default selection, disabled tabs, and indicator positioning hooks
  - expose the `./tabs` package entry and add docs/demo coverage

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add an `autofocus` prop to `Input` that reliably focuses the element on mount.

  Native `autofocus` only focuses the first autofocus element inserted per document, so it silently fails for inputs that mount inside an already-open popover/dialog or that remount as a view swaps. The prop focuses the underlying input on mount instead, so it works every time the input appears.

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add `Menu`, an accessible dropdown / action menu following the WAI-ARIA menu button pattern.
  - Compose `Menu.Root`, `Menu.Trigger`, and `Menu.Content` (portal + floating + `role="menu"` panel), built on the same positioning/presence primitives as `Popover`.
  - `Menu.Item` with `onSelect`, `disabled`, `closeOnSelect`, and `textValue`; arrow-key navigation, typeahead, Home/End, and hover highlighting via roving focus.
  - `Menu.Separator`, plus `Menu.Group` + `Menu.GroupLabel` with `aria-labelledby` wiring.
  - `Menu.SubmenuRoot` + `Menu.SubmenuTrigger` for nested submenus, with a layer stack so only the topmost menu handles Escape / outside-press, `ArrowRight`/`ArrowLeft` open/close, and sibling submenus collapse on hover.
  - `Menu.Root` exposes `open`/`defaultOpen`/`onOpenChange` (with cancelable `details`), `loop`, `typeahead`, and `closeOnSelect`. Escape and selection return focus to the trigger; Tab and outside interaction close the whole chain.

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add the ToggleGroup primitive with single and multiple selection, roving focus, disabled reconciliation, SSR-safe default selection, documentation, and demo coverage.

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add short helper types to the public `table` module for column-driven wrappers and consumer-defined table abstractions.
  - export `RowData`, `Row`, `ColumnDef`, `CellContext`, `CellProps`, and `CellRenderer`
  - keep these helpers generic so consumers can build any wrapper shape on top of the existing table primitives

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add a new headless `Tree` component with hierarchical keyboard navigation, controlled and uncontrolled expansion state, configurable selection propagation, section headers, and docs/demo coverage.

### Patch Changes

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Bias `Table.Body` virtualization overscan toward the current scroll direction when no explicit `overscan` distribution is provided, reducing the chance of visible blanking ahead of the viewport during fast scrolling.

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Summary

  Add the composable `NumberField` component with locale-aware formatting, spinbutton semantics, steppers, wheel scrubbing, and pointer scrubbing.

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix nested popovers dismissing together: add a popover layer stack so only the topmost open popover handles Escape, outside-press, outside-scroll, and focus-out. Closing a nested popover (e.g. a date picker calendar inside a filter popover) no longer closes its ancestors.

- [#53](https://github.com/human-kit/ui/pull/53) [`d26a8cd`](https://github.com/human-kit/ui/commit/d26a8cd141a855d13d57d952a66f3c72543ab1b0) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Table Body typing and overscan

  Improve `Table.Body` item-driven typings and virtualization defaults.
  - Infer the `children(item)` snippet parameter from the `items` element type in item-driven mode.
  - Make body virtualization derive `overscan` automatically from the current viewport row count when it is not provided.

- [#55](https://github.com/human-kit/ui/pull/55) [`6661958`](https://github.com/human-kit/ui/commit/6661958b309bafb2f3189aa6197017f739d4d563) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Summary

  Add the headless `TextArea` primitive with native textarea semantics, shared focus state attributes, RAC-style state props, and opt-in auto-resize.

## 1.0.0-alpha.21

### Patch Changes

- [#53](https://github.com/human-kit/ui/pull/53) [`d26a8cd`](https://github.com/human-kit/ui/commit/d26a8cd141a855d13d57d952a66f3c72543ab1b0) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Table Body typing and overscan

  Improve `Table.Body` item-driven typings and virtualization defaults.
  - Infer the `children(item)` snippet parameter from the `items` element type in item-driven mode.
  - Increase the default body virtualization `overscan` from `6` to `18` rows when it is not provided.

## 1.0.0-alpha.20

### Minor Changes

- [#51](https://github.com/human-kit/ui/pull/51) [`f96b102`](https://github.com/human-kit/ui/commit/f96b102f3c50e2401f695c92abd59788ec723f70) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Replace implicit table header sorting with an explicit `Table.SortTrigger` part. `Table.Column` no longer accepts `allowsSorting`; columns become sortable by composing `Table.SortTrigger` inside `Table.ColumnHeaderCell`.

  This change prevents nested header actions like filter popovers from triggering sort through click bubbling and lets sortable headers take DOM focus directly through the trigger while keeping the table grid navigation contract.

## 1.0.0-alpha.19

### Patch Changes

- [#49](https://github.com/human-kit/ui/pull/49) [`db8c1ce`](https://github.com/human-kit/ui/commit/db8c1ce376864d6ab6d7b298f3a80279fd2b7413) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix `Table` minimum width calculations so relative and resizable columns preserve measured minimum widths more reliably during layout and resize updates.

## 1.0.0-alpha.18

### Patch Changes

- [#46](https://github.com/human-kit/ui/pull/46) [`c68dd08`](https://github.com/human-kit/ui/commit/c68dd083c93bfcb36a383eec1a68150ecbc3002d) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix `Table` column sizing and ordering edge cases by keeping trailing flexible columns in sync during resize recovery, recomputing relative widths after viewport or container size changes, avoiding one-pixel width loss from relative-column rounding, and updating body cell column indices correctly when keyed columns reorder.

## 1.0.0-alpha.17

### Patch Changes

- [#43](https://github.com/human-kit/ui/pull/43) [`0faed71`](https://github.com/human-kit/ui/commit/0faed71ed19aed40955351bae0159b904f29ba24) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # RAC-style Table Widths

  Add `%` and `fr` support to table width state, and preserve a flexible trailing column during resize so RAC-style resizable tables can keep filling the available width.

- [#43](https://github.com/human-kit/ui/pull/43) [`0faed71`](https://github.com/human-kit/ui/commit/0faed71ed19aed40955351bae0159b904f29ba24) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Width Contract

  Treat `Table.Column.width` as a fixed width that disables user resizing, while keeping `defaultWidth` as the uncontrolled resizable initial width.

## 1.0.0-alpha.16

### Patch Changes

- [#41](https://github.com/human-kit/ui/pull/41) [`74af45c`](https://github.com/human-kit/ui/commit/74af45cf6e3809ee508a95abd93282efbcb0f936) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix table accessibility helper nodes so the sort live region and selection-unavailable description stay visually hidden without contributing to page overflow.

## 1.0.0-alpha.15

### Patch Changes

- [#39](https://github.com/human-kit/ui/pull/39) [`f4462ff`](https://github.com/human-kit/ui/commit/f4462ff4d3556dc8133cb7e90e350fd0e770ea77) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Summary

  Clean up the Table contract by removing the legacy `Table.Column.allowsResizing` prop, exporting explicit public prop types for `Table.Root`, `Table.Column`, `Table.ColumnHeaderCell`, and `Table.ColumnResizer`, and documenting the intended composition model separately from internal normalized column metadata.

## 1.0.0-alpha.14

### Minor Changes

- [#37](https://github.com/human-kit/ui/pull/37) [`dbad0a6`](https://github.com/human-kit/ui/commit/dbad0a69d654c561793cb81d92ce0149697e2c7b) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add table row actions and selection-only disabled behavior.
  - add `onRowAction` to `Table.Root` with RAC-style interaction rules across `selectionMode` and `selectionBehavior`
  - add `disabledBehavior="selection" | "all"` to split selection disabling from fully disabled rows
  - expose actionable and selection-disabled row/cell state through data attributes for styling
  - document and demo manual testing flows for toggle-mode actions, replace-mode double click actions, and disabled row behavior

## 1.0.0-alpha.13

### Patch Changes

- [#35](https://github.com/human-kit/ui/pull/35) [`222642b`](https://github.com/human-kit/ui/commit/222642b4f73475d1912598a9724e148d80f73f4a) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix ComboBox and ListBox interaction regressions around input behavior, focus handling, and virtual focus scrolling.

  This disables native browser autocomplete on ComboBox inputs, prevents the reused ListBox root from stealing DOM focus, avoids filtering flashes during popover close animations, and keeps hover-driven virtual focus from auto-scrolling overflowed option lists.

## 1.0.0-alpha.12

### Patch Changes

- [#33](https://github.com/human-kit/ui/pull/33) [`b339fe2`](https://github.com/human-kit/ui/commit/b339fe278d56040be2e2284c00f7505fe8c3b85c) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix ListBox and ComboBox interaction state issues so keyboard focus, hover, and virtual focus stay in sync.

  This includes clearing item `data-focus-visible` on pointer hover, tightening ListBox focus ownership, skipping disabled ComboBox options during keyboard navigation, and continuing keyboard navigation from the clicked option in multiselect flows.

## 1.0.0-alpha.11

### Minor Changes

- [#31](https://github.com/human-kit/ui/pull/31) [`2263415`](https://github.com/human-kit/ui/commit/2263415e56ad61747821473a121058e67699a3e8) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add follow-up ComboBox and Popover improvements after the previous prerelease changeset was already consumed.
  - Forward `Popover.Content` configuration props through `ComboBox.Popover`, including positioning options like `offset`, `placement`, `shouldFlip`, `shouldCloseOnEscape`, and `shouldCloseOnBlur`.
  - Ensure `ComboBox` virtual focus marks the active `ListBox.Item` with `data-focus-visible` during keyboard navigation.
  - Keep the interactive ComboBox docs aligned with the shared popover positioning behavior.

## 1.0.0-alpha.10

### Minor Changes

- [#28](https://github.com/human-kit/ui/pull/28) [`d6e4d57`](https://github.com/human-kit/ui/commit/d6e4d5749198946bbc03651cf53ec8c5af0055da) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add new ComboBox trigger and clear parts, plus pending and scroll improvements.
  - Add `ComboBox.Trigger` as the primary trigger part while keeping `ComboBox.Button` as a compatibility alias.
  - Add `ComboBox.Clear` to reset the input and clear the current selection without stealing focus.
  - Reflect `isPending` on trigger and clear affordances while keeping the root as the main async state source.
  - Clear the selected value when a single-select combobox input is fully emptied.
  - Allow wheel events to stay inside the combobox when a descendant scroll container can continue scrolling.
  - Prevent page scroll when neither the popover nor a descendant scroll container can scroll further.
  - Add docs coverage for pending state and the pattern where overflow is applied to `ComboBox.List` instead of `ComboBox.Popover`.

## 1.0.0-alpha.9

### Patch Changes

- [#25](https://github.com/human-kit/ui/pull/25) [`6f70e98`](https://github.com/human-kit/ui/commit/6f70e98ae5a9e33a0cbc9ccb44ad285b1db07b91) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Summary

  Make `ComboBox.Input` render through the shared `Input` primitive while preserving existing combobox behavior and accessibility semantics.

## 1.0.0-alpha.8

### Patch Changes

- [#22](https://github.com/human-kit/ui/pull/22) [`b6cba01`](https://github.com/human-kit/ui/commit/b6cba01f4cd8788ad75a4df26f756e277b9ece98) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Summary

  Upgrade `Input` to a focus-aware native input primitive with RAC-style disabled, read-only, invalid, and required state props.

## 1.0.0-alpha.7

### Patch Changes

- [#20](https://github.com/human-kit/ui/pull/20) [`896bbf0`](https://github.com/human-kit/ui/commit/896bbf0c020c419e1f5a8e543caf9201db912c9e) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Summary

  Add a new headless `Button` component with modality-aware focus state, pressed and hovered data attributes, and RAC-style pending semantics.

## 1.0.0-alpha.6

### Patch Changes

- [#18](https://github.com/human-kit/ui/pull/18) [`6197af7`](https://github.com/human-kit/ui/commit/6197af7d4289fee17ce8681bb5548784c26f7717) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix published package entrypoints so generated ESM files no longer import sibling TypeScript source paths.

## 1.0.0-alpha.5

### Minor Changes

- [#16](https://github.com/human-kit/ui/pull/16) [`fa904e3`](https://github.com/human-kit/ui/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add `Table.Checkbox` and `Table.CheckboxIndicator` for explicit row selection controls in body cells and select-all behavior in header cells, including keyboard navigation integration with the table grid.

  Add `hiddenColumns` (bindable) and `defaultHiddenColumns` props to `Table.Root` for controlled and uncontrolled column visibility. Hidden columns are excluded from grid navigation, visible column counts (`aria-colcount`), and resize interactions while preserving their registered widths.

  Add `aria-colindex` to header and body cells for accurate screen reader column position announcements.

- [#16](https://github.com/human-kit/ui/pull/16) [`fa904e3`](https://github.com/human-kit/ui/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - # Table Column Resizing

  Add column resizing support to `Table`.
  - add `Table.ColumnResizer` as a public part
  - add column width and resize APIs to `Table.Root` and `Table.Column`
  - render managed column widths through `colgroup`
  - document and demo resizable table columns

- [#16](https://github.com/human-kit/ui/pull/16) [`fa904e3`](https://github.com/human-kit/ui/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add a new `Table` component with composable parts, grid-style keyboard navigation, row selection, sorting support, docs, and tests.

- [#16](https://github.com/human-kit/ui/pull/16) [`fa904e3`](https://github.com/human-kit/ui/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add a new headless Checkbox component with Root and Indicator parts.
  - Add tri-state checkbox behavior with checked and indeterminate bindings.
  - Sync a hidden native input for form submission and label targeting.
  - Export Checkbox from the root library entrypoint and package subpath exports.
  - Add baseline docs and browser tests for checkbox interaction.

### Patch Changes

- [#16](https://github.com/human-kit/ui/pull/16) [`fa904e3`](https://github.com/human-kit/ui/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Update `Table.ColumnResizer` keyboard interaction to use an explicit Enter-to-resize mode.
  - Focused resize handles now enter keyboard resize mode with `Enter` and exit with `Enter`.
  - `Escape` cancels keyboard resizing, restores the starting width, and returns focus to the header cell.
  - Update table docs, demo styling, and tests to reflect the new focus and resize flow.

- [#16](https://github.com/human-kit/ui/pull/16) [`fa904e3`](https://github.com/human-kit/ui/commit/fa904e359589044409dbc0a4a7e0b97f016da381) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Fix table column resizing so keyboard interactions use the same resize lifecycle as pointer input, add Pointer Events support for touch and pen resizing, announce committed width changes to screen readers, respect RTL keyboard controls, support cancelling pointer drags with Escape, and reduce resize overhead with cached column lookups plus animation-frame batched drag updates. Also make table cell and header column indices react correctly when keyed column order changes and replace module-level table instance counters with per-root token generation to avoid shared SSR and test state.

## 1.0.0-alpha.4

### Minor Changes

- [#13](https://github.com/human-kit/ui/pull/13) [`7f2dc3e`](https://github.com/human-kit/ui/commit/7f2dc3e198a5a17374d2cad605370b21ebe077fc) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Refactor TimePicker panel to Apple-like wheel architecture.
  - Replace `TimePicker.Column`/`TimePicker.ColumnCell` with `TimePicker.WheelColumn`/`TimePicker.WheelItem`.
  - Migrate panel semantics from `listbox/option` to `spinbutton` per wheel column.
  - Remove `shouldCloseOnSelect` and `closeOnSelect` from `TimePicker.Root`; wheel selection now commits on snap without auto-close.
  - Replace root context column APIs with wheel APIs: `getWheelOptions`, `getSelectedWheelValue`, `selectWheelValue`.
  - Update docs and tests for wheel interaction and focus behavior.

## 1.0.0-alpha.3

### Patch Changes

- [#11](https://github.com/human-kit/ui/pull/11) [`9189203`](https://github.com/human-kit/ui/commit/918920301f9d9bc34ee80047ff73ccbcd4dbd6c8) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Standardize focus-visible modality behavior across overlay flows.
  - Remove DatePicker local interaction modality state and rely on shared input-modality primitive.
  - Restore DatePicker trigger focus via `focusWithModality` for consistent pointer/keyboard semantics.
  - Unify close-modality resolution between Popover and Dialog through shared primitive helper.
  - Align DatePicker input modality handling with shared focus-visible contract.
  - Expand input-modality tests and document primitive usage in the focus-state contract.

## 1.0.0-alpha.2

### Minor Changes

- [#6](https://github.com/human-kit/ui/pull/6) [`9a72432`](https://github.com/human-kit/ui/commit/9a72432ef238e79834b07cb42cc22b471c229094) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Add the new Calendar component as a public feature release.
  - introduce single and range selection modes
  - add keyboard navigation and accessibility improvements
  - include docs/demo integration and supporting tests

## 1.0.0-alpha.1

### Major Changes

- [#1](https://github.com/human-kit/ui/pull/1) [`635fdc1`](https://github.com/human-kit/ui/commit/635fdc15efc0349df8d89d4079dda5ba28ff3586) Thanks [@Agustin-Delgado](https://github.com/Agustin-Delgado)! - Initial release of @human-kit/ui
  - ComboBox (single & multi-select with tags, virtual focus, filtering)
  - Dialog (modal with portal, overlay, nested dialogs, focus trap)
  - ListBox (keyboard navigation, single selection)
  - Popover (floating UI positioning, click outside, trigger)
  - Input, Label, Portal primitives
  - Utility primitives (aria-hide-outside, scroll-lock, focus-trap, keyboard-navigation)
