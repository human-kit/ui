# Plan: `hiddenColumns` prop for Table.Root

## Objective

Add a `hiddenColumns` prop to `Table.Root` that accepts an array of column IDs and hides those columns automatically across header, body, and footer — without breaking the positional column↔cell mapping.

## Reviewed decisions

- Keep **physical column order** for cell-to-column mapping in body/footer rows.
- Add a separate **visible column model** for aria counts, keyboard navigation, and visible `data-column-index` values.
- Preserve hidden column widths in state so re-showing a column restores its prior size.

## API Design

### New props on `Table.Root`

```ts
hiddenColumns?: string[];              // controlled (bindable)
defaultHiddenColumns?: string[];       // uncontrolled initial state
onHiddenColumnsChange?: (ids: string[]) => void;
```

- `hiddenColumns` is **bindable** (`bind:hiddenColumns`) so consumers can sync external state (e.g. a column-visibility dropdown).
- Follows the same controlled/uncontrolled pattern as `selectedKeys`, `sortDescriptor`, and `columnWidths`.

### Internal context method

```ts
isColumnHidden(columnId: string): boolean;
```

## Hiding strategy: `display: none` — not DOM removal

Body cells map their column by DOM position (`columnIndex`). Removing a `<Table.Column>` from the DOM with `{#if}` causes body cells to misalign because the index shifts.

Using `display: none`:

- DOM order is preserved → index mapping never breaks.
- Users don't need paired `{#if}` guards in both header and every body row.
- `display: none` on native `<th>`/`<td>` is valid — the table reflows correctly.

## Implementation tasks

### 1. Context (`table/root/context.ts`)

- Add `hiddenColumnsSet: Set<string>` as reactive internal state (derived from the array prop).
- Expose `isColumnHidden(columnId: string): boolean`.
- Add `hiddenColumnsVersion` store for efficient reactive invalidation.
- Update `getColumnCount()` to exclude hidden columns from the navigable count.
- Update navigable-cells cache (`navigableCellsCache`) to skip cells belonging to hidden columns.
- Update `getRowsWithCells()` so keyboard navigation sees only visible cells.

### 2. Root component (`table/root/table-root.svelte`)

- Add props: `hiddenColumns` (bindable), `defaultHiddenColumns`, `onHiddenColumnsChange`.
- Implement controlled/uncontrolled pattern (identical to `selectedKeys`).
- Pass `hiddenColumnsSet` into the context.

### 3. Column (`table/column/table-column.svelte`)

- Read `isColumnHidden(id)` from context.
- If hidden → propagate hidden state to column context so children can react.

### 4. ColumnHeaderCell (`table/column-header-cell/`)

- Apply `display: none` when column is hidden.
- Set `aria-hidden="true"` when hidden.
- Exclude from tab order.

### 5. Cell (`table/cell/table-cell.svelte`)

- Resolve column from `columnIndex` (existing behavior).
- If column is hidden → apply `display: none` and `aria-hidden="true"`.
- Exclude from tab order and focus navigation.

### 6. ColumnResizer (`table/column-resizer/`)

- Not navigable or interactive while its column is hidden.

### 7. Keyboard navigation

- Arrow left/right must skip cells of hidden columns.
- Home/End must target the first/last **visible** cell.
- If the currently focused cell becomes hidden, move focus to the nearest visible cell.
- Ctrl+A is unaffected (operates on rows, not columns).

### 8. Sorting and column widths

- Sorting a hidden column: keep the descriptor but do not render a visual indicator.
- Column widths: hidden columns retain their width in the Map but do not affect layout.

## Tests

### Rendering

- Hidden column is not visible in the DOM (`display: none` on header, body, and footer cells).
- Columns not listed in `hiddenColumns` render normally.
- Dynamically changing `hiddenColumns` shows/hides columns reactively.

### Bindable / controlled

- `bind:hiddenColumns` reflects bidirectional changes.
- `defaultHiddenColumns` applies only on initial mount.
- `onHiddenColumnsChange` fires when the set changes internally.

### Keyboard navigation

- Arrow left/right skip cells of hidden columns.
- Home/End target the first/last visible cell.
- Tab enters the grid on a visible cell (never a hidden one).
- Hiding the column of the currently focused cell moves focus to the nearest visible neighbor.

### Feature interactions

- Selection checkboxes in a hidden column: row selection still works.
- Sorting by a hidden column does not crash; descriptor is preserved.
- Column resize: hidden column is not resizable while hidden.
- `getColumnCount()` returns only visible columns.
- Empty `hiddenColumns` array has no effect.

### Accessibility

- Hidden cells carry `aria-hidden="true"` in header, body, and footer.
- `aria-colcount` on the `<table>` reflects only **visible** columns.
- `aria-colindex` on visible cells is recalculated excluding hidden columns.
- Screen readers do not announce hidden columns during navigation.

## Files affected

| File                                                       | Change                                     |
| ---------------------------------------------------------- | ------------------------------------------ |
| `table/root/context.ts`                                    | State, methods, caches                     |
| `table/root/table-root.svelte`                             | Props, binding, controlled pattern         |
| `table/column/table-column.svelte`                         | Propagate hidden state                     |
| `table/column-header-cell/table-column-header-cell.svelte` | `display: none`, `aria-hidden`             |
| `table/cell/table-cell.svelte`                             | `display: none`, `aria-hidden`, skip focus |
| `table/column-resizer/table-column-resizer.svelte`         | Skip interaction when hidden               |
| `table/index.parts.ts`                                     | Type exports if needed                     |
| `table/index.ts`                                           | Type exports if needed                     |
| `table/root/*.test.ts`                                     | New test cases                             |

## Execution order

1. Context — state + methods (foundation)
2. Root — props + binding (public API → context)
3. Column + ColumnHeaderCell — hide header
4. Cell — hide body/footer cells
5. ColumnResizer — disable interaction
6. Navigation — update keyboard nav to skip hidden cells
7. Tests — validate all above
8. Accessibility — audit aria attributes
9. Demo page — add visibility toggle to the playground
