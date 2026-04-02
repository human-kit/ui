<!-- markdownlint-disable MD007 MD010 MD060 -->

# Table Plan

## Goal

Design and implement a new public `Table` component for the Svelte library, using the React Aria Components usability model as the main reference, but adapting it to the repository conventions: part-based composition, centralized state in `Root`, typed context, Svelte 5 runes, colocated tests for each part, and component/part documentation.

## Product Goals

- Provide a composable and readable API for headless tables.
- Prioritize robust and predictable keyboard navigation.
- Support row selection and sorting in the first version.
- Keep the initial scope reasonable so the component is not blocked by advanced features.
- Establish an internal foundation that can be extended later.

## Repository References

### Patterns to Follow

- Namespace-style exports and named exports, as in `ListBox`.
- Explicit typed context in `root/context.ts`.
- Controlled/uncontrolled state pattern in `Root`.
- Colocated interaction and accessibility tests.
- Base component README plus a README for each public part.

### Relevant Components and Utilities

- `packages/svelte/src/lib/listbox`
- `packages/svelte/src/lib/calendar`
- `packages/svelte/src/lib/primitives/keyboard-navigation.ts`
- `packages/svelte/src/lib/FOCUS_STATE_CONTRACT.md`
- `packages/svelte/src/lib/test-utils/focus-contract.ts`

## Decisions Already Made

- The v1 public API will be static/composable, not dynamic.
- `Table` must support cell focus and row-derived focus state.
- `Table.Column` is added to the anatomy to solve column metadata.
- `Table.Column` is a logical component with no DOM output; it registers column metadata in context. `Table.ColumnHeaderCell` renders the `<th>`.
- `Table.EmptyState` is a dedicated part for the body empty state.
- V1 must include:
	- base anatomy
	- `Table.Footer`
	- `Table.EmptyState`
	- keyboard grid navigation
	- row selection
	- sorting

## V1 Scope

### Proposed Public Anatomy

```svelte
<Table.Root aria-label="Users">
	<Table.Header>
		<Table.Row>
			<!-- Column es lógico (sin DOM), solo registra metadata -->
			<!-- Column is logical (no DOM), it only registers metadata -->
			<Table.Column id="email" isRowHeader>
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group" allowsSorting>
				<Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		<Table.Row id="danilo">
			<Table.Cell>danilo@example.com</Table.Cell>
			<Table.Cell>Developer</Table.Cell>
		</Table.Row>
		<Table.Row id="zahra">
			<Table.Cell>zahra@example.com</Table.Cell>
			<Table.Cell>Admin</Table.Cell>
		</Table.Row>

		<!-- Only shown when Body has no rows -->
		<Table.EmptyState>No users found.</Table.EmptyState>
	</Table.Body>

	<Table.Footer>
		<Table.Row>
			<Table.Cell>Total</Table.Cell>
			<Table.Cell>2 users</Table.Cell>
		</Table.Row>
	</Table.Footer>
</Table.Root>
```

### Target Public Parts

- `Table.Root`
- `Table.Column` — logical, no DOM
- `Table.Header`
- `Table.Body`
- `Table.EmptyState`
- `Table.Footer`
- `Table.Row`
- `Table.ColumnHeaderCell`
- `Table.Cell`

## Semantics and Accessibility

### Semantic Model

- The table should behave as an interactive table, not only as a passive `<table>`.
- The primary reference is a `grid` model with directional navigation.
- `Table.Root` must require an accessible name through `aria-label` or `aria-labelledby`.
- There must be support for marking a column as `isRowHeader` to improve screen reader announcements.

### Recommended Semantic Rendering

- `Table.Root` should render `<table role="grid">`.
- `Table.Header` should render `<thead role="rowgroup">`.
- `Table.Body` should render `<tbody role="rowgroup">`.
- `Table.Footer` should render `<tfoot role="rowgroup">`.
- `Table.Row` should render `<tr role="row">`.
- `Table.ColumnHeaderCell` should render `<th role="columnheader">`.
- `Table.Cell` should render:
	- `<th scope="row" role="rowheader">` when the associated column has `isRowHeader`
	- `<td role="gridcell">` in all other cases

This combination preserves real HTML semantics while allowing interactive grid behavior without inventing a structure entirely based on `div`s.

### Focus Model

Two related levels will be implemented:

1. **DOM focus on cell/header cell**
	 - `Table.ColumnHeaderCell` and `Table.Cell` are the real navigation targets.
	 - This keeps the behavior close to React Aria Components.

2. **Row-derived state**
	 - `Table.Row` exposes derived states such as focused row, selected row, or disabled row.
	 - This helps with styling and simplifies the visual experience.

### Target Keyboard Support in V1

- `Tab` enters and leaves the grid.
- Arrow keys navigate between header cells and body cells.
- `Home` / `End` move to the start/end of the current row.
- `Ctrl/Cmd + Home` and `Ctrl/Cmd + End` may be evaluated as an enhancement if the 2D engine can support them without extra complexity.
- `Enter` / `Space` should trigger row selection when appropriate.
- Sortable headers should respond to keyboard input to change sort order.

### Recommended Tabbability Strategy

- `Table.Root` should not be tabbable under normal conditions.
- Only one `Table.ColumnHeaderCell` or `Table.Cell` should have `tabindex="0"` at a time.
- All other navigable cells should have `tabindex="-1"`.
- When entering with `Tab` from outside:
	- if there is a previously focused cell, focus is restored there
	- otherwise focus enters the first navigable header cell
	- if no header is navigable, focus enters the first navigable body cell
- `Shift+Tab` and `Tab` should allow the browser to leave the grid naturally from the active cell.

This preserves the roving tabindex pattern and avoids making `Root` compete with cells as a focus target.

### Decision for `Footer`

- In v1, `Table.Footer` is mainly semantic/structural.
- It will not participate in the main grid focus flow unless a clear need appears during implementation.

## Key Types

```ts
/** Sort direction */
type SortDirection = 'ascending' | 'descending';

/** Active sort descriptor */
type SortDescriptor = {
	column: string;
	direction: SortDirection;
};

/** Row selection mode */
type SelectionMode = 'none' | 'single' | 'multiple';

/** Selectable key (Row ids) */
type SelectionKey = string | number;

/** Set of selected keys (Row ids) */
type SelectionSet = Set<SelectionKey>;

/** Coordinate within the 2D grid (global, header row 0 = row 0) */
type GridCoord = {
	row: number;
	col: number;
};
```

## Proposed V1 API

### `Table.Root`

Responsibilities:

- register columns, rows, and cells
- maintain the 2D focus cursor
- expose controlled/uncontrolled selection state
- expose controlled/uncontrolled sorting state
- coordinate ARIA attributes and focus/selection data attributes

Tentative API:

- `aria-label` / `aria-labelledby` — required accessible name
- `selectionMode?: SelectionMode` — default `'none'`
- `selectedKeys?: SelectionSet`
- `defaultSelectedKeys?: SelectionSet`
- `onSelectionChange?: (keys: SelectionSet) => void`
- `sortDescriptor?: SortDescriptor`
- `defaultSortDescriptor?: SortDescriptor`
- `onSortChange?: (descriptor: SortDescriptor) => void`
- `disabledKeys?: Set<SelectionKey>` — disabled row ids
- `children`

### `Table.Column`

> Logical component — does not render its own DOM element. Registers column metadata in `Root` context and wraps `ColumnHeaderCell`.

Responsibilities:

- define stable column identity
- register column metadata in context (sorting, row header)
- serve as the anchor for sorting and row header semantics
- leave a future path for width/resizing

Tentative API:

- `id: string` — stable column identity
- `allowsSorting?: boolean`
- `isRowHeader?: boolean`
- `textValue?: string`
- possible future space for `width`, `minWidth`, `maxWidth`

### `Table.Header`

Responsibilities:

- contain header rows
- coordinate header semantics

### `Table.Body`

Responsibilities:

- contain data rows
- coordinate `Table.EmptyState` visibility when there are no rows

Tentative API:

- `children`

> The empty state is handled through the dedicated `Table.EmptyState` part inside `Body`, not through a prop.

### `Table.EmptyState`

Responsibilities:

- render empty-state content when `Body` has no rows
- hide itself automatically when rows exist
- not participate in the grid navigation model

Tentative API:

- `children`

Recommended semantics:

- `Table.EmptyState` should be a convenience part that internally renders a row and an empty-state cell.
- Its output should be equivalent to:

```svelte
<tr role="row" data-empty>
	<td role="gridcell" colspan={columnCount}>
		{children}
	</td>
</tr>
```

- `colspan` should be resolved automatically from the number of registered columns.
- It should not be focusable or participate in 2D navigation.
- It should only be allowed inside `Table.Body`.

This avoids invalid markup inside `<tbody>` and keeps the API convenient for consumers.

### `Table.Footer`

Responsibilities:

- contain summary/metadata rows
- not interfere with the main v1 navigation model

### `Table.Row`

Responsibilities:

- row identity
- disabled state
- derived selection state
- derived focus/selection styling

Tentative API:

- `id`
- `isDisabled?: boolean`
- `textValue?: string`

### `Table.ColumnHeaderCell`

Responsibilities:

- focus target in the header
- sorting trigger when the column allows it
- apply `aria-sort` automatically from `Root.sortDescriptor` and `Column.allowsSorting`
- `aria-sort` values: `ascending` | `descending` | `none`

### `Table.Cell`

Responsibilities:

- focus target within the body
- reflect derived row selection state
- support simple textual content in v1

## Data Attributes by Part

| Part               | Attribute             | Values                       | Description                              |
| ------------------ | --------------------- | ---------------------------- | ---------------------------------------- |
| `Root`             | `data-selection-mode` | `none`, `single`, `multiple` | Active selection mode                    |
| `Header`           | `data-table-header`   | `''`                         | Semantic marker                          |
| `Body`             | `data-table-body`     | `''`                         | Semantic marker                          |
| `Body`             | `data-empty`          | `''`                         | Present when Body has no rows            |
| `Footer`           | `data-table-footer`   | `''`                         | Semantic marker                          |
| `Row` (body)       | `data-focused`        | `''`                         | The row contains the focused cell        |
| `Row` (body)       | `data-selected`       | `''`                         | Selected row                             |
| `Row` (body)       | `data-disabled`       | `''`                         | Disabled row                             |
| `ColumnHeaderCell` | `data-focused`        | `''`                         | Focused header cell                      |
| `ColumnHeaderCell` | `data-sortable`       | `''`                         | The column allows sorting                |
| `ColumnHeaderCell` | `data-sort-direction` | `ascending`, `descending`    | Active sort direction                    |
| `Cell`             | `data-focused`        | `''`                         | Focused cell                             |
| `Cell`             | `data-row-selected`   | `''`                         | The row containing this cell is selected |

## ARIA Attributes by Part

| Part               | Attribute                        | Value                             | Description                                            |
| ------------------ | -------------------------------- | --------------------------------- | ------------------------------------------------------ |
| `Root`             | `role`                           | `grid`                            | Interactive table                                      |
| `Root`             | `aria-label` / `aria-labelledby` | string                            | Accessible name (required)                             |
| `Root`             | `aria-multiselectable`           | `true`                            | Present when `selectionMode='multiple'`                |
| `Header`           | `role`                           | `rowgroup`                        | Header row group                                       |
| `Body`             | `role`                           | `rowgroup`                        | Data row group                                         |
| `Footer`           | `role`                           | `rowgroup`                        | Footer row group                                       |
| `Row`              | `role`                           | `row`                             | Row                                                    |
| `Row` (body)       | `aria-selected`                  | `true` / `false`                  | Selection state (when `selectionMode != 'none'`)       |
| `Row` (body)       | `aria-disabled`                  | `true`                            | Disabled row                                           |
| `ColumnHeaderCell` | `role`                           | `columnheader`                    | Column header                                          |
| `ColumnHeaderCell` | `aria-sort`                      | `ascending`, `descending`, `none` | Sort direction (only when `allowsSorting`)             |
| `Cell`             | `role`                           | `gridcell` or `rowheader`         | `rowheader` if the column has `isRowHeader`            |
| `EmptyState`       | `role`                           | `row` + internal `gridcell`       | Semantic, non-navigable empty-state row                |

## What V1 Does Not Include

### Out of Scope

- column resizing
- drag and drop
- async loading / load more
- API pública dinámica con `items` y `columns`
- row actions / row links
- typeahead
- focus management para elementos interactivos dentro de `Cell`
- focus management for interactive elements inside `Cell`
- nested headers / grouped columns
- cell selection
- cell selection
- virtualización
- virtualization
- soporte complejo de `colSpan` / `rowSpan`
- complex `colSpan` / `rowSpan` support
- footer navegable como parte del grid principal
- footer navigation as part of the main grid

## Advanced Feature Matrix

| Feature                                | Main Complexity                                            | Risk       | Recommendation     |
| -------------------------------------- | ---------------------------------------------------------- | ---------- | ------------------ |
| Column resizing                        | width state, handles, pointer + keyboard, persistence      | high       | keep out of v1     |
| Drag and drop                          | reorder, drop targets, SR + keyboard + pointer            | very high  | keep out of v1     |
| Async loading / load more              | scroll state, sentinel rows, partial states                | high       | keep out of v1     |
| Dynamic `items` / `columns` API        | collection, stable ids, render functions, memoization      | high       | defer              |
| Row actions / row links                | conflicts between actions, selection, and HTML limitations | medium/high| defer              |
| Interactive content inside `Cell`      | focus handoff between grid and nested controls             | very high  | keep out of v1     |
| Typeahead                              | depends on stable collection and consistent `textValue`    | medium     | defer              |
| Nested headers / column groups         | spans, navigation, and complex semantics                   | high       | keep out of v1     |
| Cell selection                         | changes the entire interaction model                       | high       | keep out of v1     |
| Full `selectionBehavior="replace"`    | modifiers and fine-grained focus/selection semantics       | medium/high| defer              |
| Virtualization                         | strong decoupling between collection and DOM               | very high  | keep out of v1     |
| Integrated select-all                  | useful UX but depends on mature selection behavior         | medium     | phase 2            |
| Complex `colSpan` / `rowSpan`          | breaks the rectangular grid model                          | high       | defer              |
| Navigable footer                       | adds another region to the focus model                     | medium     | avoid in v1        |

## Proposed Internal Architecture

## Root State

Create `packages/svelte/src/lib/table/root/context.ts` with responsibilities for:

- column registration
- row registration
- cell registration by coordinate
- current focus resolution
- 2D navigation
- row selection state
- sorting state
- derived utilities for each part

## 2D Navigation Engine

It is not enough to depend only on `createKeyboardNavigation()` because it currently solves linear navigation. `Table` needs a dedicated engine able to:

- know rows and columns by index
- move focus in two dimensions
- distinguish header and body
- resolve missing or disabled cells
- derive the active row from the active cell

### Proposed Internal Interface

```ts
interface GridNavigation {
	/** Currently focused coordinate (global, header row 0 = row 0) */
	focusedCoord: GridCoord;

	/** Moves focus in the given direction, skipping non-navigable cells */
	move(direction: 'up' | 'down' | 'left' | 'right'): void;

	/** Moves focus to the first cell in the current row */
	moveToRowStart(): void;

	/** Moves focus to the last cell in the current row */
	moveToRowEnd(): void;

	/** Moves focus to the first cell in the grid (header[0][0]) */
	moveToGridStart(): void;

	/** Moves focus to the last cell in the body */
	moveToGridEnd(): void;

	/** Registers a navigable cell in the grid */
	register(coord: GridCoord, element: HTMLElement): void;

	/** Unregisters a cell from the grid */
	unregister(coord: GridCoord): void;

	/** Checks whether a coordinate is navigable (exists and is not disabled) */
	isNavigable(coord: GridCoord): boolean;

	/** Returns the body row index from a global coordinate */
	toBodyRowIndex(globalRow: number): number | null;

	/** Applies DOM focus to the element at the given coordinate */
	focusCell(coord: GridCoord): void;
}
```

### Key-to-Action Mapping

| Key                      | Action                                                      |
| ------------------------ | ----------------------------------------------------------- |
| `ArrowUp`                | `move('up')`                                                |
| `ArrowDown`              | `move('down')`                                              |
| `ArrowLeft`              | `move('left')`                                              |
| `ArrowRight`             | `move('right')`                                             |
| `Home`                   | `moveToRowStart()`                                          |
| `End`                    | `moveToRowEnd()`                                            |
| `Ctrl+Home` / `Cmd+Home` | `moveToGridStart()`                                         |
| `Ctrl+End` / `Cmd+End`   | `moveToGridEnd()`                                           |
| `Tab`                    | Leaves the grid (focus to the next tabbable element)        |
| `Shift+Tab`              | Leaves the grid (focus to the previous tabbable element)    |
| `Enter` / `Space`        | Select row (body) or toggle sort (sortable header)          |

## Selection

- V1 selection is row-based.
- Focus must not be equivalent to selection.
- `single` and `multiple` must work in both controlled and uncontrolled mode.
- Disabled rows must not be selectable.

## Sorting

- Sort state should live in `Root`.
- `Column` defines whether a column allows sorting.
- `ColumnHeaderCell` triggers sort changes.
- The component reflects state, but does not necessarily mutate data automatically; that remains the consumer's responsibility.

## Planned File Structure

### New Component Files

- `packages/svelte/src/lib/table/index.ts`
- `packages/svelte/src/lib/table/index.parts.ts`
- `packages/svelte/src/lib/table/README.md`
- `packages/svelte/src/lib/table/TODO.md`

### Root

- `packages/svelte/src/lib/table/root/table-root.svelte`
- `packages/svelte/src/lib/table/root/context.ts`
- `packages/svelte/src/lib/table/root/table-root.test.ts`
- `packages/svelte/src/lib/table/root/table-test.svelte`
- `packages/svelte/src/lib/table/root/README.md`

### Public Parts

- `packages/svelte/src/lib/table/column/table-column.svelte`
- `packages/svelte/src/lib/table/column/README.md`
- `packages/svelte/src/lib/table/column/table-column.test.ts`
- `packages/svelte/src/lib/table/header/table-header.svelte`
- `packages/svelte/src/lib/table/header/README.md`
- `packages/svelte/src/lib/table/header/table-header.test.ts`
- `packages/svelte/src/lib/table/body/table-body.svelte`
- `packages/svelte/src/lib/table/body/README.md`
- `packages/svelte/src/lib/table/body/table-body.test.ts`
- `packages/svelte/src/lib/table/empty-state/table-empty-state.svelte`
- `packages/svelte/src/lib/table/empty-state/README.md`
- `packages/svelte/src/lib/table/empty-state/table-empty-state.test.ts`
- `packages/svelte/src/lib/table/footer/table-footer.svelte`
- `packages/svelte/src/lib/table/footer/README.md`
- `packages/svelte/src/lib/table/footer/table-footer.test.ts`
- `packages/svelte/src/lib/table/row/table-row.svelte`
- `packages/svelte/src/lib/table/row/README.md`
- `packages/svelte/src/lib/table/row/table-row.test.ts`
- `packages/svelte/src/lib/table/column-header-cell/table-column-header-cell.svelte`
- `packages/svelte/src/lib/table/column-header-cell/README.md`
- `packages/svelte/src/lib/table/column-header-cell/table-column-header-cell.test.ts`
- `packages/svelte/src/lib/table/cell/table-cell.svelte`
- `packages/svelte/src/lib/table/cell/README.md`
- `packages/svelte/src/lib/table/cell/table-cell.test.ts`

### Package Integrations

- `packages/svelte/src/lib/index.ts`
- `packages/svelte/package.json`
- `docs/src/routes/docs/table/+page.svelte`
- `README.md`
- `.changeset/*`

## Implementation Strategy

### Phase 1: Public Contract

- finalize the public anatomy
- finalize prop naming
- define exact responsibilities for each part
- document minimal examples

### Phase 2: State and Navigation

- implement root context
- implement column/row/cell registration
- build 2D navigation
- add data attributes and focus contract

### Phase 3: Selection and Sorting

- add controlled/uncontrolled selection
- add disabled rows
- add per-column sorting
- validate keyboard behavior

### Phase 4: Docs and Tests

- tests for each public part
- integral harness
- base README and per-part READMEs
- docs demo page
- changeset

## Testing Plan

### Minimum Cases

- correct semantic rendering
- required accessible label
- arrow-key navigation between cells
- row-level `Home` / `End`
- entering/leaving the grid with `Tab`
- correct focus-visible and focus attributes
- single selection
- multiple selection
- disabled rows
- sorting via keyboard and pointer
- empty state
- `Footer` renders without breaking main navigation

### Test Inspirations

- `ListBox` tests
- `Calendar` tests
- focus contract tests

## Main Risks

- without a clear 2D engine, the component may end up stuck between a passive table and an interactive grid
- mixing cell focus with row selection requires very explicit rules
- if `Footer` joins the focus flow too early, the model becomes unnecessarily complex
- allowing interactive content inside cells in v1 may break the keyboard experience

## V1 Success Criteria

- the public API is clear and consistent with the rest of the library
- keyboard navigation feels close to React Aria Components in the core cases
- sorting and selection work without ambiguity
- tests cover critical behavior
- the implementation leaves real room for future phases without breaking the API

## Recommended Next Step

Turn this plan into a more concrete API specification, part by part and prop by prop, before creating implementation files.
