<!-- markdownlint-disable MD013 MD033 MD056 MD060 -->

# Table Selection Checkbox Plan

## Goal

Document the intended design for `Table.Checkbox` and `Table.CheckboxIndicator` parts that integrate with the existing table selection model without adding a separate high-level selection API.

The component should be composable, predictable, and aligned with the current `Table` architecture:

- part-based composition
- centralized state in `Table.Root`
- typed context contracts
- Svelte 5 runes
- keyboard navigation consistent with the current grid model

## Confirmed Decisions

- Public names: `Table.Checkbox` and `Table.CheckboxIndicator`
- Composition model: the consumer places it manually inside `Table.Cell` and `Table.ColumnHeaderCell`
- Focus target: the checkbox itself, not the table cell
- Body behavior: toggles the row selection state and reflects it visually
- Header behavior: acts as select-all / deselect-all only in `selectionMode="multiple"`
- Header partial state: must support indeterminate state
- Auto-visibility:
  - when `selectionMode="none"`, all selection checkboxes should disappear
  - when `selectionMode="single"`, body checkboxes stay visible but the header checkbox should disappear
- The component should own its auto-hide behavior instead of pushing this responsibility to the consumer

## Non-Goals

- Do not add a separate slot-based table selection API for v1
- Do not require a dedicated selection column abstraction
- Do not reuse the generic `Checkbox.Root` implementation blindly if it complicates table focus/navigation integration
- Do not make row selection depend on clicking the full row when explicit checkbox UI is present

## Proposed Public Anatomy

```svelte
<Table.Root selectionMode="multiple" bind:selectedKeys>
	<Table.Header>
		<Table.Row>
			<Table.Column id="selection">
				<Table.ColumnHeaderCell>
					<Table.Checkbox>
						<Table.CheckboxIndicator>
							<CheckIcon />
						</Table.CheckboxIndicator>
					</Table.Checkbox>
				</Table.ColumnHeaderCell>
			</Table.Column>

			<Table.Column id="email" isRowHeader>
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		{#each rows as row (row.id)}
			<Table.Row id={row.id}>
				<Table.Cell>
					<Table.Checkbox>
						<Table.CheckboxIndicator>
							<CheckIcon />
						</Table.CheckboxIndicator>
					</Table.Checkbox>
				</Table.Cell>
				<Table.Cell>{row.email}</Table.Cell>
			</Table.Row>
		{/each}
	</Table.Body>
</Table.Root>
```

## Why This Shape

- It preserves the existing `Table` mental model: columns, header cells, body cells, footer cells.
- It avoids a parallel API such as `selection` slots or special root props that would only exist for one specific control.
- It keeps selection UI opt-in and composable.
- It allows consumers to position the checkbox column exactly where they need it.

## Section-Based Behavior

The component behavior depends on where it is rendered.

| Location                 | `selectionMode="none"` | `selectionMode="single"` | `selectionMode="multiple"`   |
| ------------------------ | ---------------------- | ------------------------ | ---------------------------- |
| `Table.ColumnHeaderCell` | hidden                 | hidden                   | visible, select-all checkbox |
| `Table.Cell` in body row | hidden                 | visible, row toggle      | visible, row toggle          |
| footer cell              | hidden                 | hidden                   | hidden                       |

## Behavior Details

### Body Checkbox

- Renders only inside body rows when `selectionMode` is not `none`
- Checked state mirrors whether the current row is selected
- Disabled state mirrors whether the current row is disabled
- Clicking it toggles the row through the same selection pipeline used by the table
- Keyboard interaction should behave like a table navigation target, not like an isolated form field

### Header Checkbox

- Renders only inside header cells when `selectionMode="multiple"`
- Checked when all selectable rows are selected
- Indeterminate when some selectable rows are selected but not all
- Unchecked when no selectable rows are selected
- Clicking it selects all selectable rows or clears the current selection
- Disabled when there are no selectable rows

## Focus Model

The current table uses a roving tabindex model on cells. For `Table.Checkbox`, the desired behavior is different:

- the checkbox should receive DOM focus directly
- the table should still treat that checkbox as the focus target for the parent cell's grid position
- arrow-key navigation must continue to work from the checkbox

This implies a focus-delegation mechanism from `Table.Cell` to a child control.

### Proposed Focus Delegation

- `Table.Cell` keeps owning the grid key and participation in layout/focus bookkeeping
- a child control can register itself as the focus delegate for that cell
- when the table moves focus to that cell, the registered delegate receives DOM focus
- when the delegate receives focus, it synchronizes the table's focused-cell state

This is preferable to making the checkbox a completely separate navigable entity because it preserves the current grid architecture.

## Keyboard Expectations

When a `Table.Checkbox` is focused:

- `Space` toggles selection
- `Enter` toggles selection
- `ArrowUp` / `ArrowDown` move within the table grid
- `ArrowLeft` / `ArrowRight` move within the table grid
- `Home` / `End` move to row boundaries
- `Ctrl/Cmd + Home` and `Ctrl/Cmd + End` use the existing table-wide navigation behavior
- `Ctrl/Cmd + A` keeps the current multiple-selection behavior

The checkbox should not become a keyboard dead-end inside the table.

## State Requirements in `TableContext`

To support the header checkbox cleanly, the table context should expose a small amount of additional selection state:

- a way to determine whether all selectable rows are selected
- a way to determine whether some selectable rows are selected
- a way to clear the current selection without changing `selectionMode`

One reasonable shape is:

```ts
type TableSelectionCheckboxState = 'none' | 'some' | 'all';

getSelectionCheckboxState(): TableSelectionCheckboxState;
deselectAllRows(): void;
```

This should build on the existing ordered selectable row computation rather than duplicating selection rules in the component.

## Accessibility Expectations

- The checkbox should expose `role="checkbox"`
- `aria-checked` should be:
  - `"true"` when checked
  - `"false"` when unchecked
  - `"mixed"` when indeterminate
- Disabled state should map to `aria-disabled`
- The header checkbox should have an accessible label like `Select all rows`
- Row checkboxes should have an accessible label like `Select row` or a consumer-provided label if the row content needs more specificity

## Rendering Strategy

The component does not need to be a full form checkbox.

Because this control is tightly coupled to the table's grid navigation and selection logic, a lightweight table-specific implementation is likely more appropriate than directly wrapping the generic checkbox component. The generic checkbox has different responsibilities, including form integration, that are not required here.

## Open Questions

### Structural Validation

If consumers place `Table.Checkbox` manually, it becomes easier to create invalid layouts accidentally.

Examples:

- header includes a selection checkbox column but body rows do not
- some rows render fewer cells than others
- the checkbox is placed in a footer cell where it has no behavior

We should consider adding dev-time validation for mismatched column/cell counts and possibly invalid placement.

### Labeling API

The initial implementation can ship with sensible default labels, but we may want to support explicit labels later for highly customized row content.

### Generic Focus Delegates

If focus delegation is added for this part, it should be designed as a reusable mechanism rather than a one-off checkbox hack.

## Implementation Outline

### Phase 1: Context and Focus Plumbing

- extend table selection helpers for header checkbox state
- add `deselectAllRows()`
- add focus delegation support from cells to nested controls

### Phase 2: New Part

- add `packages/ui/src/lib/table/selection-checkbox/`
- implement `table-selection-checkbox.svelte`
- export it from `index.parts.ts` and `index.ts`

### Phase 3: Tests

- body checkbox renders and toggles correctly
- header checkbox auto-hides correctly by selection mode
- header checkbox supports checked / mixed / unchecked states
- disabled rows stay disabled
- focus lands on the checkbox instead of the parent cell
- arrow navigation still works when the checkbox has focus

### Phase 4: Documentation and Demo

- add part README if the part becomes public
- update table README anatomy
- update the docs demo with a selection checkbox column

## Summary

`Table.Checkbox` should be a small, composable part that plugs into the existing table selection model rather than a new selection subsystem. `Table.CheckboxIndicator` keeps the visuals fully consumer-controlled. The key implementation challenge is not checkbox visuals, but integrating direct checkbox focus with the table's current roving-focus grid behavior.
