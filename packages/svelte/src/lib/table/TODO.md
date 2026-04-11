# Table TODO

## Goal

Ship a stable `Table` v1 with keyboard navigation, row selection, sorting, documentation, and reliable accessibility semantics.

## Backlog

### Bugs / Correctness

- [x] [M][P0][Area: Correctness][Owner: Unassigned][Target: Done] Deduplicate sync registration calls — `syncXxxRegistration()` runs both synchronously at mount and inside `$effect`, causing a redundant `notifyLayout()` per part on initial render (Column, Row, Cell, ColumnHeaderCell).
- [x] [S][P0][Area: Correctness][Owner: Unassigned][Target: Done] Make `cellIndex` in `Table.Cell` reactive — currently captured once via `row.registerCellToken(key)` and never updated if cells are dynamically reordered within a row.
- [x] [C][P1][Area: Correctness][Owner: Unassigned][Target: Done] Replace module-level monotonic counters (`columnInstanceId`, `rowInstanceId`, etc.) with per-`Table.Root` token generation so SSR and repeated tests do not share global instance state.

### Behavior

- [x] [M][P1][Area: Behavior][Owner: Unassigned][Target: Done] Align row focus state semantics — current row-level `data-focused` behaves more like `focus-within`; either rename/expose a distinct `data-focus-within` contract or implement true row focus semantics.
- [x] [M][P1][Area: Behavior][Owner: Unassigned][Target: Done] Define and document the text-selection policy when row selection is enabled — keep browser-native behavior or add an explicit opt-in/opt-out API instead of ad hoc styling in examples.
- [x] [S][P2][Area: Behavior][Owner: Unassigned][Target: Done] Verify that changing `selectionMode` between `multiple`, `single`, and `none` preserves the intended normalization rules in all controlled and uncontrolled flows.
- [x] [M][P0][Area: Behavior][Owner: Unassigned][Target: Done] Make `Table.ColumnResizer` keyboard interactions run the same resize lifecycle as pointer interactions so width freezing and resize callbacks stay consistent.
- [x] [M][P1][Area: Behavior][Owner: Unassigned][Target: Done] Allow cancelling an in-progress `Table.ColumnResizer` drag with `Escape`, restoring the starting width instead of forcing the partial drag result.

### Accessibility

- [x] [M][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Enforce accessible name on `Table.Root` — warn in dev when neither `aria-label` nor `aria-labelledby` is provided (WCAG 4.1.2).
- [x] [M][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Add `aria-disabled` to focusable body cells inside disabled rows — currently only the `<tr>` carries `aria-disabled`, leaving screen readers unaware at the cell level.
- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Announce committed `Table.ColumnResizer` width changes through a polite live region and expose `aria-valuetext` so keyboard resizing has reliable screen reader feedback.
- [x] [M][P0][Area: Accessibility][Owner: Unassigned][Target: Done] Move `Table.ColumnResizer` drag handling to Pointer Events so touch, pen, and mouse resizing use the same path.
- [x] [S][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Make `Table.ColumnResizer` keyboard arrow semantics respect RTL layouts so logical resize controls match the visual direction.
- [ ] [M][P1][Area: Accessibility][Owner: Unassigned][Target: TBD] Validate screen reader announcements for `rowheader`, `columnheader`, and `aria-sort` across NVDA and VoiceOver.
- [x] [M][P1][Area: Accessibility][Owner: Unassigned][Target: Done] Resolve footer grid semantics — footer cells live inside `role="grid"` but are unreachable by keyboard; either include footer in navigation or mark `<tfoot>` with `role="none"` to exclude it from the grid.
- [x] [S][P2][Area: Accessibility][Owner: Unassigned][Target: Done] Add `aria-rowcount` and `aria-colcount` to the grid element for screen reader dimension announcements.
- [x] [S][P2][Area: Accessibility][Owner: Unassigned][Target: Done] Add an `aria-live="polite"` visually-hidden region to announce sort changes (NVDA/JAWS do not always announce `aria-sort` updates).
- [x] [S][P2][Area: Accessibility][Owner: Unassigned][Target: Done] Add explicit `role="row"` to the `Table.EmptyState` `<tr>` for strict ARIA parent-child validation (`gridcell` requires `row` parent).

### Performance

- [x] [M][P1][Area: Performance][Owner: Unassigned][Target: Done] Cache `getOrderedRowTokens` result and invalidate on `notifyLayout` — currently re-sorts with `compareDocumentPosition` on every focus move, selection, and row count query.
- [x] [M][P1][Area: Performance][Owner: Unassigned][Target: Done] Replace repeated linear column-id scans in table resize helpers with an O(1) id-to-token lookup inside `Table.Root` context.
- [x] [S][P1][Area: Performance][Owner: Unassigned][Target: Done] Batch `Table.ColumnResizer` pointer drag updates with `requestAnimationFrame` so width writes and store updates stay aligned to paint frames.
- [x] [M][P2][Area: Performance][Owner: Unassigned][Target: Done] Cache `getNavigableCells()` / `getRowsWithCells()` and invalidate on layout changes — currently reconstructs full cell map on every `moveFocus` call.
- [ ] [S][P2][Area: Performance][Owner: Unassigned][Target: TBD] Migrate version stores from `writable` (svelte/store) to `$state` runes for idiomatic Svelte 5 reactivity and potential batching improvements.

### DX

- [x] [M][P1][Area: DX][Owner: Unassigned][Target: Done] Break the controlled `selectedKeys` feedback loop — the `$effect` that syncs `selectedKeys` to `ctx.setSelection` also fires after internal selection changes via `onSelectionChange`, causing a redundant `notifySelection`.
- [x] [S][P2][Area: DX][Owner: Unassigned][Target: Done] Remove inline `style="outline: none;"` from Cell and ColumnHeaderCell — it overrides consumer inline styles; let consumers handle focus-visible styling via `data-focus-visible` / `data-focused` attributes instead.
- [x] [S][P2][Area: DX][Owner: Unassigned][Target: Done] Document `defaultSelectedKeys` and `defaultSortDescriptor` props in the README and docs page.
- [ ] [C][P2][Area: DX][Owner: Unassigned][Target: TBD] Export component prop types (`TableRootProps`, `TableRowProps`, `TableCellProps`, etc.) so consumers can type wrapper components.
- [ ] [C][P2][Area: DX][Owner: Unassigned][Target: TBD] Evaluate whether exposing `context` as a `$bindable` prop on `Table.Root` is necessary or if a narrower public API would be safer.
- [ ] [C][P3][Area: DX][Owner: Unassigned][Target: TBD] Extract a shared registration helper to eliminate the duplicated sync-then-effect pattern across Column, Row, Cell, and ColumnHeaderCell.

### UX

- [x] [S][P2][Area: UX][Owner: Unassigned][Target: Done] Document the intentional behavior that clicking outside the table does not clear selection in `replace` mode.
- [ ] [C][P3][Area: UX][Owner: Unassigned][Target: TBD] Consider exposing `cursor` guidance via data attributes so sortable headers get `cursor: pointer` and non-sortable headers get `cursor: default` without custom CSS.

### API Design

- [x] [M][P1][Area: API][Owner: Unassigned][Target: Done] Decide whether controlled clearing of `sortDescriptor` should accept `undefined` explicitly or require an additional API.
- [x] [S][P2][Area: Behavior][Owner: Unassigned][Target: Done] Confirm whether disabled body rows should remain keyboard-focusable or be skipped by navigation.
- [ ] [S][P2][Area: API][Owner: Unassigned][Target: TBD] Decide whether `Table.Column` should hard-enforce a single `Table.ColumnHeaderCell` child.
- [ ] [S][P2][Area: API][Owner: Unassigned][Target: TBD] Decide whether clipboard-related behavior should remain fully browser-native in v1 or be deferred behind a future explicit cell-selection model.

### Features

- [ ] [C][P1][Area: Features][Owner: Unassigned][Target: TBD] Add controlled and uncontrolled column filtering APIs — support per-column filters plus a global filter hook so `Table` can cover common data-grid scenarios without forcing consumers to build parallel filter state from scratch.
- [ ] [C][P1][Area: Features][Owner: Unassigned][Target: TBD] Add column visibility controls — allow columns to be shown/hidden dynamically while preserving keyboard navigation, sort state, selection column layout, and resize state for still-visible columns.
- [ ] [C][P1][Area: Features][Owner: Unassigned][Target: TBD] Add multi-column sorting — support ordered sort descriptors so users can compose secondary and tertiary sorts instead of being limited to a single active sort key.
- [ ] [C][P1][Area: Features][Owner: Unassigned][Target: TBD] Add pagination primitives — define a controlled pagination model for large datasets, including page index, page size, and total row count integration without coupling `Table` to a specific data-fetching strategy.
- [ ] [C][P1][Area: Features][Owner: Unassigned][Target: TBD] Evaluate row virtualization support — provide a path for very large tables while preserving grid semantics, roving tabindex behavior, selection, and resize interactions.
- [ ] [C][P2][Area: Features][Owner: Unassigned][Target: TBD] Add sticky header and pinned-column support — enable frozen headers and utility columns (selection, row headers, actions) for wide or scroll-heavy tables.
- [ ] [C][P2][Area: Features][Owner: Unassigned][Target: TBD] Add expandable rows / subrows — support master-detail rows and tree-like disclosure patterns without forcing consumers to break the table's row and cell registration model.
- [ ] [C][P2][Area: Features][Owner: Unassigned][Target: TBD] Add inline cell and row editing primitives — define an opt-in editing model that can coexist with current focus, selection, and keyboard navigation contracts.
- [ ] [M][P2][Area: Features][Owner: Unassigned][Target: TBD] Add column action primitives — expose a path for header menus, quick sort/filter actions, and future column management UI without requiring consumers to hand-roll header action composition every time.
- [ ] [M][P3][Area: Features][Owner: Unassigned][Target: TBD] Add row actions patterns — document or expose a composable pattern for common trailing actions columns so selection, row press, and nested interactive controls do not conflict.

### Tests

- [x] [M][P1][Area: Tests][Owner: Unassigned][Target: Done] Add tests for `Home`, `End`, `Ctrl+Home`, and `Ctrl+End` keyboard navigation.
- [x] [S][P2][Area: Tests][Owner: Unassigned][Target: Done] Add test for full sort cycle via keyboard (ascending → descending) and verify no way to clear sort with keyboard is intentional.
- [x] [S][P2][Area: Tests][Owner: Unassigned][Target: Done] Add test verifying disabled rows are not selected when arrow-navigated in `replace` mode.
- [x] [S][P2][Area: Tests][Owner: Unassigned][Target: Done] Add tests covering `selectionMode` transitions after mount, including collapsing multiple selections to one on `single`.

### Docs

- [ ] [C][P2][Area: Docs][Owner: Unassigned][Target: TBD] Add richer styling examples and sorting guidance to the docs page.
- [x] [C][P3][Area: Docs][Owner: Unassigned][Target: Done] Document that `Table.Column` is a logical-only wrapper (no DOM output) prominently in the README anatomy section.
- [x] [S][P2][Area: Docs][Owner: Unassigned][Target: Done] Document `selectionMode="none"` normalization behavior and clarify that selection is cleared internally when selection is disabled.

### Selection Checkbox

- [ ] [M][P1][Area: Performance][Owner: Unassigned][Target: TBD] Cache `getOrderedSelectableRowIds()` and invalidate on layout/selection changes — currently rebuilds the full selectable-row array on every call to `getSelectionCheckboxState()`, `hasSelectableRows()`, `selectAllRows()`, and `extendSelectionToRow()`, causing O(n) work per selection change.
- [ ] [M][P1][Area: Accessibility][Owner: Unassigned][Target: TBD] Validate `Table.Checkbox` screen reader announcements across NVDA and VoiceOver — verify that `aria-checked="mixed"` transitions in the header checkbox and row selection toggles are announced correctly.
- [ ] [M][P1][Area: Correctness][Owner: Unassigned][Target: TBD] Document or resolve `Table.Checkbox` bypass of `pressRow()` — the checkbox always calls `toggleRowSelection()` directly, ignoring `selectionBehavior="replace"` semantics (Shift+click range, Ctrl+click toggle). This is intentional for checkbox UX but undocumented and inconsistent with row-click behavior.
- [ ] [M][P1][Area: Correctness][Owner: Unassigned][Target: TBD] Add dev-time structural validation for `Table.Checkbox` placement — warn when header includes a selection checkbox column but body rows do not, or when the checkbox is placed in a footer cell where it has no behavior.

### Code Quality

- [ ] [C][P3][Area: Code Quality][Owner: Unassigned][Target: TBD] Remove unused keyboard/click handlers from `Table.Cell` when rendering in footer scope — currently handlers are bound but short-circuit via guards.
