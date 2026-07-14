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

- `packages/ui/src/lib/listbox`
- `packages/ui/src/lib/calendar`
- `packages/ui/src/lib/primitives/keyboard-navigation.ts`
- `packages/ui/src/lib/FOCUS_STATE_CONTRACT.md`
- `packages/ui/src/lib/test-utils/focus-contract.ts`

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
- register column width constraints in context
- serve as the anchor for sorting and row header semantics
- serve as the anchor for width/resizing behavior

Tentative API:

- `id: string` — stable column identity
- `allowsSorting?: boolean`
- `isRowHeader?: boolean`
- `textValue?: string`
- `width?: number | string`
- `defaultWidth?: number | string`
- `minWidth?: number`
- `maxWidth?: number`

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
- host the resize affordance when the consumer composes a `Table.ColumnResizer` inside it

### `Table.ColumnResizer`

Responsibilities:

- interactive resize handle for the current `Table.Column`
- consume column identity from `Table.Column` context rather than matching by visual position
- support pointer drag and keyboard resizing
- expose resize state for styling through data attributes

Tentative API:

- `step?: number` — keyboard delta in px, default `16`
- `shiftStep?: number` — larger keyboard delta in px, default `48`
- `children?`
- `class?`

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

| Part               | Attribute                        | Value                             | Description                                      |
| ------------------ | -------------------------------- | --------------------------------- | ------------------------------------------------ |
| `Root`             | `role`                           | `grid`                            | Interactive table                                |
| `Root`             | `aria-label` / `aria-labelledby` | string                            | Accessible name (required)                       |
| `Root`             | `aria-multiselectable`           | `true`                            | Present when `selectionMode='multiple'`          |
| `Header`           | `role`                           | `rowgroup`                        | Header row group                                 |
| `Body`             | `role`                           | `rowgroup`                        | Data row group                                   |
| `Footer`           | `role`                           | `rowgroup`                        | Footer row group                                 |
| `Row`              | `role`                           | `row`                             | Row                                              |
| `Row` (body)       | `aria-selected`                  | `true` / `false`                  | Selection state (when `selectionMode != 'none'`) |
| `Row` (body)       | `aria-disabled`                  | `true`                            | Disabled row                                     |
| `ColumnHeaderCell` | `role`                           | `columnheader`                    | Column header                                    |
| `ColumnHeaderCell` | `aria-sort`                      | `ascending`, `descending`, `none` | Sort direction (only when `allowsSorting`)       |
| `Cell`             | `role`                           | `gridcell` or `rowheader`         | `rowheader` if the column has `isRowHeader`      |
| `EmptyState`       | `role`                           | `row` + internal `gridcell`       | Semantic, non-navigable empty-state row          |

## What V1 Does Not Include

### Out of Scope

- drag and drop
- async loading / load more
- API pública dinámica con `items` y `columns`
- row links / `href`-style navigation semantics
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

| Feature                            | Main Complexity                                          | Risk        | Recommendation     |
| ---------------------------------- | -------------------------------------------------------- | ----------- | ------------------ |
| Column resizing                    | width state, handles, pointer + keyboard, persistence    | high        | next planned phase |
| Drag and drop                      | reorder, drop targets, SR + keyboard + pointer           | very high   | keep out of v1     |
| Async loading / load more          | scroll state, sentinel rows, partial states              | high        | keep out of v1     |
| Dynamic `items` / `columns` API    | collection, stable ids, render functions, memoization    | high        | defer              |
| Row actions / `onRowAction`        | action-selection conflicts across mouse and keyboard     | medium/high | next planned phase |
| Row links / `href` semantics       | HTML limitations, router integration, native link parity | high        | defer              |
| Interactive content inside `Cell`  | focus handoff between grid and nested controls           | very high   | keep out of v1     |
| Typeahead                          | depends on stable collection and consistent `textValue`  | medium      | defer              |
| Nested headers / column groups     | spans, navigation, and complex semantics                 | high        | keep out of v1     |
| Cell selection                     | changes the entire interaction model                     | high        | keep out of v1     |
| Full `selectionBehavior="replace"` | modifiers and fine-grained focus/selection semantics     | medium/high | defer              |
| Virtualization                     | strong decoupling between collection and DOM             | very high   | keep out of v1     |
| Integrated select-all              | useful UX but depends on mature selection behavior       | medium      | phase 2            |
| Complex `colSpan` / `rowSpan`      | breaks the rectangular grid model                        | high        | defer              |
| Navigable footer                   | adds another region to the focus model                   | medium      | avoid in v1        |

## Proposed Internal Architecture

## Root State

Create `packages/ui/src/lib/table/root/context.ts` with responsibilities for:

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

| Key                      | Action                                                   |
| ------------------------ | -------------------------------------------------------- |
| `ArrowUp`                | `move('up')`                                             |
| `ArrowDown`              | `move('down')`                                           |
| `ArrowLeft`              | `move('left')`                                           |
| `ArrowRight`             | `move('right')`                                          |
| `Home`                   | `moveToRowStart()`                                       |
| `End`                    | `moveToRowEnd()`                                         |
| `Ctrl+Home` / `Cmd+Home` | `moveToGridStart()`                                      |
| `Ctrl+End` / `Cmd+End`   | `moveToGridEnd()`                                        |
| `Tab`                    | Leaves the grid (focus to the next tabbable element)     |
| `Shift+Tab`              | Leaves the grid (focus to the previous tabbable element) |
| `Enter` / `Space`        | Select row (body) or toggle sort (sortable header)       |

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

- `packages/ui/src/lib/table/index.ts`
- `packages/ui/src/lib/table/index.parts.ts`
- `packages/ui/src/lib/table/README.md`
- `packages/ui/src/lib/table/TODO.md`

### Root

- `packages/ui/src/lib/table/root/table-root.svelte`
- `packages/ui/src/lib/table/root/context.ts`
- `packages/ui/src/lib/table/root/table-root.test.ts`
- `packages/ui/src/lib/table/root/table-test.svelte`
- `packages/ui/src/lib/table/root/README.md`

### Public Parts

- `packages/ui/src/lib/table/column/table-column.svelte`
- `packages/ui/src/lib/table/column/README.md`
- `packages/ui/src/lib/table/column/table-column.test.ts`

## Phase 2: Column Resizing Plan

### Resize Goal

Add column resizing in a way that follows the React Aria Components mental model while preserving the repository's existing `Table` architecture: logical `Table.Column`, state in `Table.Root`, typed context, native table semantics, and composable parts.

### Functional Contract

- Resizing must target the column whose composition includes the resize handle.
- The resize handle must live inside the header composition for that column, not in a parallel list of handlers.
- The active column is resolved from `Table.Column` context, never by visual index guessing alone.
- Functional behavior should mirror RAC:
  - a column opts into resizing via column metadata
  - a dedicated resizer part provides the interactive affordance
  - widths can be controlled or uncontrolled
  - pointer and keyboard resizing are both supported

### Recommended Public Composition

```svelte
<Table.Root aria-label="Users" bind:columnWidths>
	<Table.Header>
		<Table.Row>
			<Table.Column id="email" isRowHeader allowsSorting defaultWidth={280} minWidth={180}>
				<Table.ColumnHeaderCell>
					<span>Email</span>
					<Table.ColumnResizer />
				</Table.ColumnHeaderCell>
			</Table.Column>

			<Table.Column id="group" allowsSorting defaultWidth={180} minWidth={140}>
				<Table.ColumnHeaderCell>
					<span>Group</span>
					<Table.ColumnResizer />
				</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		<!-- rows -->
	</Table.Body>
</Table.Root>
```

### API Recommendation

#### Width Props on `Table.Column`

Add the following props:

- `width?: number | string`
- `defaultWidth?: number | string`
- `minWidth?: number`
- `maxWidth?: number`

Notes:

- `width` is the controlled width for the column.
- `defaultWidth` is the uncontrolled initial width.
- rendering `Table.ColumnResizer` is the public resize opt-in for the owning column.

#### Width State on `Table.Root`

Add root-level width state APIs:

- `columnWidths?: Map<string, number>`
- `defaultColumnWidths?: Map<string, number>`
- `onColumnWidthsChange?: (widths: Map<string, number>) => void`
- `onColumnResizeStart?: (columnId: string) => void`
- `onColumnResizeEnd?: (widths: Map<string, number>) => void`

Notes:

- Controlled/uncontrolled width state should mirror the existing `selectedKeys` and `sortDescriptor` contracts.
- Widths in root state should be normalized to px numbers even if consumer input allows string forms.

#### `Table.ColumnResizer` Part

Public part to place inside `Table.ColumnHeaderCell`.

Tentative props:

- `step?: number`
- `shiftStep?: number`
- `class?: string`
- `children?: Snippet`

No `columnId` prop should be needed; it must use `Table.Column` context.

### Why Not a Parallel `ColumnHandler`

This API should explicitly avoid a separate sibling structure like:

```svelte
<Table.Column id="email" />
<Table.Column id="group" />
<Table.ColumnHandler index={0} />
<Table.ColumnHandler index={1} />
```

Reasons:

- position-based matching becomes fragile with dynamic columns
- it duplicates the concept of column identity
- it becomes harder to keep sorting, row-header semantics, and resizing anchored to the same column contract
- it does not follow the RAC model, where resizing is column-owned and the handle is colocated with the header content

### Width Model

#### Effective Width Resolution

For each registered column, compute the effective width from highest to lowest precedence:

1. `Table.Root.columnWidths.get(columnId)`
2. `Table.Column.width`
3. `Table.Root.defaultColumnWidths.get(columnId)`
4. `Table.Column.defaultWidth`
5. no explicit width

Then clamp the result against:

- `minWidth`
- `maxWidth`

#### Initial Implementation Constraint

For the first resizing implementation, normalize widths to px values.

- Accept `number` as px.
- Optionally accept `"123px"` and normalize it to `123`.
- Defer `%`, `fr`, and more advanced layout math until the base feature is stable.

This keeps the state model simple and reduces layout bugs.

### Rendering Strategy

The recommended implementation is to generate a `<colgroup>` inside `Table.Root` from the registered columns and the effective widths.

Reasons:

- widths apply consistently to both header and body cells
- native table layout remains intact
- it avoids pushing per-cell width styles into every `Table.Cell`
- it scales better as the feature grows

Planned approach:

- `Table.Root` renders a managed `<colgroup>` before children
- each registered column maps to one `<col>`
- effective width is applied to the `<col>`
- body and header cells keep their semantic markup unchanged

Fallback if `<colgroup>` proves insufficient for some cases:

- apply inline width/min-width styles to header cells and derived styles to body cells by column index

But `<colgroup>` should be the default strategy.

### Interaction Model

#### Pointer

- pointer down on `Table.ColumnResizer` starts resizing for its current column
- movement computes a new width in px relative to the starting header width
- width updates continuously during drag
- pointer up finalizes the interaction and calls `onColumnResizeEnd`

#### Keyboard

- the resizer is focusable
- `ArrowLeft` reduces width by `step`
- `ArrowRight` increases width by `step`
- `Shift+ArrowLeft` / `Shift+ArrowRight` use `shiftStep`
- resize keyboard handling should not hijack the existing table cell navigation when the resizer itself is not focused

### Accessibility Contract

`Table.ColumnResizer` should behave like a column separator/resizer control.

Recommended attributes:

- `role="separator"`
- `aria-orientation="vertical"`
- `aria-valuenow`
- `aria-valuemin`
- `aria-valuemax`
- accessible label derived from the current column, for example `Resize Email column`

Derived data attributes:

- `data-resizing`
- `data-focused`
- `data-focus-visible`
- `data-resizable-direction="right"`

### Internal Architecture Additions

#### `root/context.ts`

Extend column registration to include:

- `width`
- `defaultWidth`
- `minWidth`
- `maxWidth`

Add root-level APIs for:

- resolving effective column widths
- updating a column width by `columnId`
- starting/ending resize interactions
- reading resize state for a column

#### New Part Context Usage

`Table.ColumnResizer` should consume:

- `Table.Column` context for `columnId`
- `Table.Root` context for width state and resize actions

It should not require positional props like `index` or `for`.

### Planned File Additions

- `packages/ui/src/lib/table/column-resizer/table-column-resizer.svelte`
- `packages/ui/src/lib/table/column-resizer/README.md`
- `packages/ui/src/lib/table/column-resizer/table-column-resizer.test.ts`

Planned touched files:

- `packages/ui/src/lib/table/index.parts.ts`
- `packages/ui/src/lib/table/index.ts`
- `packages/ui/src/lib/table/root/context.ts`
- `packages/ui/src/lib/table/root/table-root.svelte`
- `packages/ui/src/lib/table/column/table-column.svelte`
- `packages/ui/src/lib/table/column-header-cell/table-column-header-cell.svelte`
- `packages/ui/src/lib/table/root/table-root.test.ts`
- `docs/src/routes/docs/table/+page.svelte`

### Testing Plan

Minimum regression coverage:

- renders a resize handle only for columns composed with `Table.ColumnResizer`
- dragging the resizer changes the associated column width only
- resizing one column does not corrupt neighboring column identity
- controlled `columnWidths` updates are reflected in the DOM
- uncontrolled `defaultWidth` is honored on mount
- keyboard resizing updates width in deterministic steps
- min/max constraints are enforced
- focus and pointer interactions on the resizer do not break table navigation

### Recommended Implementation Order

1. Add API fields to `Table.Column` and root context registration.
2. Add root width state and effective width resolution.
3. Render managed `<colgroup>` from `Table.Root`.
4. Add `Table.ColumnResizer` pointer interaction.
5. Add keyboard and ARIA support for the resizer.
6. Add docs/demo and controlled/uncontrolled tests.

### Non-Goals for the First Resize Release

- percentage/fr width math
- column resize persistence outside consumer-provided state
- multi-column proportional redistribution
- double-click auto-fit
- resize in nested/grouped headers
- resizable footer-specific behavior
- `packages/ui/src/lib/table/header/table-header.svelte`
- `packages/ui/src/lib/table/header/README.md`
- `packages/ui/src/lib/table/header/table-header.test.ts`
- `packages/ui/src/lib/table/body/table-body.svelte`
- `packages/ui/src/lib/table/body/README.md`
- `packages/ui/src/lib/table/body/table-body.test.ts`
- `packages/ui/src/lib/table/empty-state/table-empty-state.svelte`
- `packages/ui/src/lib/table/empty-state/README.md`
- `packages/ui/src/lib/table/empty-state/table-empty-state.test.ts`
- `packages/ui/src/lib/table/footer/table-footer.svelte`
- `packages/ui/src/lib/table/footer/README.md`
- `packages/ui/src/lib/table/footer/table-footer.test.ts`
- `packages/ui/src/lib/table/row/table-row.svelte`
- `packages/ui/src/lib/table/row/README.md`
- `packages/ui/src/lib/table/row/table-row.test.ts`
- `packages/ui/src/lib/table/column-header-cell/table-column-header-cell.svelte`
- `packages/ui/src/lib/table/column-header-cell/README.md`
- `packages/ui/src/lib/table/column-header-cell/table-column-header-cell.test.ts`
- `packages/ui/src/lib/table/cell/table-cell.svelte`
- `packages/ui/src/lib/table/cell/README.md`
- `packages/ui/src/lib/table/cell/table-cell.test.ts`

### Package Integrations

- `packages/ui/src/lib/index.ts`
- `packages/ui/package.json`
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

## Resize Testing Plan

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

## Phase 3: Row Actions and Disabled Behavior Plan

### Phase 3 Goal

Add row actions in a way that matches the React Aria Components mental model closely enough for consumers to predict behavior, while still fitting the existing `Table` architecture in this repository:

- `Table.Root` remains the single owner of interaction state
- `Table.Row` and `Table.Cell` remain semantic wrappers over native table elements
- selection and actions are treated as related but distinct interactions
- disabled state becomes more explicit so selection-only disabling does not accidentally disable focus or actions

This phase is specifically about `onRowAction` and `disabledBehavior`. It does not attempt to solve full row-as-link semantics or nested interactive controls inside arbitrary cells.

### Reference Behavior

The intended behavioral reference is React Aria's collection model for selection and item actions:

- `selectionBehavior="toggle"` keeps action as the primary row press interaction until the user enters a selection state
- `selectionBehavior="replace"` makes selection the primary pointer interaction and uses double click for row actions
- keyboard behavior separates selection from action more strictly:
  - `Space` is selection-oriented
  - `Enter` is action-oriented when actions are available

The goal is functional parity for the supported cases, not a byte-for-byte clone of RAC internals.

### Public API Recommendation

#### `Table.Root` Props

Add the following props:

- `onRowAction?: (id: TableSelectionKey) => void`
- `disabledBehavior?: 'selection' | 'all'`

Prerequisite:

- `selectionBehavior?: 'toggle' | 'replace'` must already exist and be part of the stable `Table.Root` contract for this phase to make sense. This phase depends on the existing selection-behavior model rather than introducing a parallel row-press API.

Defaults:

- `onRowAction` default: `undefined`
- `disabledBehavior` default: `'all'`

Rationale:

- `onRowAction` belongs at the collection root because the component is built around row ids and centralized interaction state
- `disabledBehavior` also belongs at the root because the current disabled model is collection-driven (`disabledKeys`) and should stay consistent across row-local and root-provided disabled state

#### No New `rowPressBehavior` Prop

This phase should not add a new `rowPressBehavior` prop.

Reasons:

- the desired behavior is already derivable from the combination of:
  - `onRowAction`
  - `selectionMode`
  - `selectionBehavior`
- React Aria already establishes a recognizable interaction contract based on those inputs
- a separate `rowPressBehavior` prop would create redundant states and undocumented invalid combinations

### Phase 3 Interaction Model

#### Core Principle

There are now three distinct row-level concepts:

1. row focus
2. row selection
3. row action

The implementation must stop treating `pressRow()` as if it were synonymous with selection. A row press should first be classified, then routed to either selection logic, action logic, or both depending on the active mode.

#### Pointer Behavior Without `onRowAction`

When `onRowAction` is not provided, the component should preserve the current selection semantics:

- `selectionMode="none"`: row/cell click does nothing selection-related
- `selectionBehavior="toggle"`: row/cell click toggles selection
- `selectionBehavior="replace"`: row/cell click replaces selection according to current replace-mode rules

This preserves backwards compatibility.

#### Pointer Behavior With `onRowAction`

##### `selectionMode="none"`

Regardless of `selectionBehavior`:

- single click on row or cell executes `onRowAction(id)`
- double click does not have special meaning beyond the browser's normal click sequence
- no selection state is changed

##### `selectionBehavior="toggle"` with selection enabled

When `selectionMode` is `single` or `multiple` and `onRowAction` exists:

- if the table currently has no selected rows:
  - single click executes `onRowAction(id)`
  - click does not change row selection
- if the table currently has at least one selected row:
  - single click on a row follows toggle selection semantics
  - click does not execute `onRowAction`

This matches the RAC notion that action is the default press interaction until the user has entered a selection workflow.

Important documentation note:

- this behavior changes dynamically based on whether the table currently has an active selection
- that dynamic switch is powerful but can also surprise consumers and end users if it is not documented clearly
- docs should call this out explicitly and describe it as an intentional RAC-aligned interaction model rather than a bug or inconsistency
- if future consumer feedback shows this is too implicit, a dedicated escape hatch can be evaluated later, but this phase should ship the RAC-style default first

##### `selectionBehavior="replace"` with selection enabled

When `selectionMode` is `single` or `multiple` and `onRowAction` exists:

- single click selects the row using replace-mode semantics
- double click executes `onRowAction(id)`
- the first click of the double-click sequence still performs selection

Callback ordering requirement:

- because the first click in the double-click sequence performs selection, `onSelectionChange` must fire before `onRowAction`
- docs should state this ordering explicitly so consumers do not assume the action callback is the first observable event in the interaction

This is the clearest and most familiar desktop-style interaction model for replace mode.

### Keyboard Model

#### Rows and Cells Without `onRowAction`

Keep existing behavior:

- `Enter` and `Space` continue to use selection behavior when appropriate

#### Rows and Cells With `onRowAction`

Apply the following contract in body rows:

- `Enter` executes `onRowAction(id)` when the row is actionable
- `Space` performs selection when selection is allowed for that row
- arrow keys keep their existing focus/navigation behavior

This keyboard split applies even when pointer behavior differs between `toggle` and `replace`.

#### Detailed Keyboard Rules

| State                                      | `Enter`                    | `Space`                    |
| ------------------------------------------ | -------------------------- | -------------------------- |
| `selectionMode="none"` + `onRowAction`     | action                     | no-op                      |
| `selectionMode="single"` + `onRowAction`   | action                     | selection                  |
| `selectionMode="multiple"` + `onRowAction` | action                     | selection                  |
| any mode without `onRowAction`             | current selection behavior | current selection behavior |

Notes:

- in `replace` mode, `Space` must not be treated as action even though pointer uses double click for action
- `Ctrl/Cmd+Space` in `multiple` + `replace` should preserve the existing non-contiguous selection behavior
- `Shift+ArrowUp/Down` in `replace` should continue to extend selection; `onRowAction` must not interfere with that contract

### Checkbox Interaction Rules

`Table.Checkbox` remains the explicit selection affordance.

Rules:

- checkbox interactions must never trigger `onRowAction`
- checkbox interaction should continue to stop propagation so row presses are not synthesized accidentally
- when `disabledBehavior="selection"`, the checkbox is disabled even if the row remains actionable
- checkbox semantics remain selection-only, even when `selectionBehavior="replace"`

This preserves a clean mental model: checkbox equals selection, row press may mean action or selection depending on state.

### `disabledBehavior` Semantics

#### `'all'`

This is the current effective behavior and should remain the default.

When a row is disabled by `disabledKeys` or `Table.Row isDisabled` and `disabledBehavior="all"`:

- row cannot be selected
- row cannot trigger `onRowAction`
- row is skipped by focus navigation
- row should not be tabbable directly
- body cells in that row should not be tabbable directly
- checkbox is disabled

#### `'selection'`

When a row is disabled and `disabledBehavior="selection"`:

- row cannot be selected
- row cannot be added to or removed from selection by click
- row cannot be selected by `Space`
- row cannot be selected via replace-mode arrow synchronization
- checkbox is disabled
- row can still receive focus
- row can still participate in keyboard navigation
- row can still trigger `onRowAction`

This mode means disabled-for-selection, not disabled-for-interaction.

### Disabled State Matrix

| Condition                                     | Focusable | Selectable                | Actionable                     |
| --------------------------------------------- | --------- | ------------------------- | ------------------------------ |
| enabled row                                   | yes       | yes, per selection config | yes, when `onRowAction` exists |
| disabled row + `disabledBehavior="all"`       | no        | no                        | no                             |
| disabled row + `disabledBehavior="selection"` | yes       | no                        | yes, when `onRowAction` exists |

### Recommended Internal Refactor

#### Split the Existing Disabled Model

The current `isRowDisabled()` helper is too coarse for the new behavior. Internally, the root context should introduce separate predicates, or equivalent derived logic, for:

- row disabled for focus/navigation
- row disabled for selection
- row disabled for action

The public API does not need to expose all of these separately, but the internal model should.

Recommended internal helpers:

- `isRowSelectionDisabled(id, localDisabled?)`
- `isRowActionDisabled(id, localDisabled?)`
- `isRowInteractionDisabled(id, localDisabled?)`
- `canRowReceiveFocus(id, localDisabled?)`

These names are illustrative; exact naming can be refined during implementation.

#### Split the Existing Press Pipeline

The current `pressRow()` API is selection-oriented. This phase should replace that single concept with a more explicit pipeline.

Recommended root-level methods:

- `performRowAction(id)`
- `pressRowSelection(id, interaction)`
- `pressRow(id, source, interaction)` as a coordinator, or equivalent separate handlers

The coordinator should decide behavior using:

- presence of `onRowAction`
- `selectionMode`
- `selectionBehavior`
- whether there is an active selection
- whether the row is disabled for selection or for all interactions
- whether the source was pointer single click, pointer double click, `Enter`, or `Space`

### Affected Parts

#### `root/context.ts` Changes

Will need to own:

- `onRowAction`
- `disabledBehavior`
- selection-disabled vs action-disabled resolution
- row action dispatch helpers
- press classification helpers

#### `root/table-root.svelte`

Will need to:

- accept and sync the new props into context
- expose any new root-level data attributes if useful for styling/debugging

#### `row/table-row.svelte`

Will need to:

- update row tabbability based on `disabledBehavior`
- handle `Enter` as action when available
- handle `Space` as selection when available
- ensure row-level keydown no longer assumes `Enter` and `Space` are always equivalent

#### `cell/table-cell.svelte`

Will need to:

- classify pointer click behavior differently when `onRowAction` exists
- support double-click action in `replace` mode
- align keydown behavior with the row contract so focus target does not change semantics

#### `checkbox/table-checkbox.svelte`

Will need to:

- disable itself from selection-only disabled rows
- keep stopping propagation so row actions are not accidentally fired
- preserve explicit selection behavior independently from row-action semantics

### Event Contract Recommendation

For the first release of this feature, `onRowAction` should receive only the row id:

```ts
onRowAction?: (id: TableSelectionKey) => void;
```

Reasons:

- aligns with the current root-level API style (`onSelectionChange`, `onSortChange`)
- keeps the surface simple while the interaction model is still stabilizing
- avoids prematurely freezing an event-detail contract that may need more nuance later

If consumers later need trigger metadata, a future non-breaking addition could evolve this to an object payload or add a second callback.

### Data Attribute Plan

This phase should add row-level state markers for styling and debugging:

- `data-actionable="true"` when the row can trigger `onRowAction`
- `data-disabled-behavior="selection" | "all"` on `Table.Root`
- `data-selection-disabled="true"` on rows/cells when selection is blocked but action remains available

`data-actionable` should be treated as required for this phase rather than optional.

Reasons:

- consumers need a reliable styling hook for actionable rows
- cursor styling depends on this (`cursor: pointer` vs default)
- once row actions exist, actionable state is part of the public styling contract rather than an internal implementation detail

### Accessibility Plan

Requirements for this phase:

- rows that are action-enabled but selection-disabled must still expose coherent keyboard interaction
- `aria-disabled` should only reflect non-interactive rows under `disabledBehavior="all"`
- rows disabled only for selection should not be presented as fully disabled if they remain actionable and focusable
- checkbox disabled state must remain announced correctly

Explicit decision:

- rows under `disabledBehavior="selection"` should not add compensating `aria-roledescription` just to explain partial disabled state
- the row should remain announced according to its normal table/grid semantics
- the disabled checkbox remains the primary assistive-technology signal that selection is unavailable
- docs should explain that selection-only disabled rows are still actionable and focusable, while accessibility semantics stay conservative rather than inventing a custom roledescription

This is important because reusing the current all-or-nothing `aria-disabled` contract under `disabledBehavior="selection"` would misrepresent the row to assistive technology.

### Behavior Matrix

#### Pointer Summary

| `selectionMode`       | `selectionBehavior`   | `onRowAction`                | row click         | row double click       |
| --------------------- | --------------------- | ---------------------------- | ----------------- | ---------------------- |
| `none`                | `toggle` or `replace` | no                           | no-op             | no-op                  |
| `none`                | `toggle` or `replace` | yes                          | action            | same as click sequence |
| `single` / `multiple` | `toggle`              | no                           | selection toggle  | same as click sequence |
| `single` / `multiple` | `toggle`              | yes, no active selection     | action            | same as click sequence |
| `single` / `multiple` | `toggle`              | yes, active selection exists | selection toggle  | same as click sequence |
| `single` / `multiple` | `replace`             | no                           | replace selection | same as click sequence |
| `single` / `multiple` | `replace`             | yes                          | replace selection | action                 |

#### Keyboard Summary

| `selectionMode`       | `onRowAction` | `Enter`                     | `Space`                     |
| --------------------- | ------------- | --------------------------- | --------------------------- |
| `none`                | no            | no-op                       | no-op                       |
| `none`                | yes           | action                      | no-op                       |
| `single` / `multiple` | no            | existing selection behavior | existing selection behavior |
| `single` / `multiple` | yes           | action                      | selection                   |

### Phase 3 Testing Plan

Minimum regression coverage:

- `selectionMode="none"` + `onRowAction` triggers action on row click
- basic pointer action tests should land before double-click support so the action pipeline is validated incrementally
- `selectionBehavior="toggle"` + `onRowAction` triggers action on click when selection is empty
- `selectionBehavior="toggle"` + `onRowAction` toggles selection on click once a selection exists
- `selectionBehavior="replace"` + `onRowAction` selects on click and acts on double click
- `Enter` triggers action and `Space` triggers selection when both are available
- `disabledBehavior="selection"` disables checkbox and selection changes but still allows action
- `disabledBehavior="all"` blocks focus, selection, and action
- disabled rows under `selection` are skipped by selection sync but not by pure focus navigation
- disabled row + `disabledBehavior="selection"` + `onRowAction` + `Enter` triggers action
- checkbox never triggers `onRowAction`
- existing replace-mode selection extension (`Shift+Arrow`, `Ctrl/Cmd+Space`) remains intact

### Documentation Plan

Docs and README updates should include:

- a new section explaining the difference between row actions and row selection
- examples for:
  - action-only rows (`selectionMode="none"`)
  - mixed action + selection in `toggle`
  - mixed action + selection in `replace`
  - `disabledBehavior="selection"`
- an explicit note that in `toggle` mode the meaning of row click changes when a selection becomes active
- an explicit note that in `replace` mode double click emits callbacks in the order `onSelectionChange` then `onRowAction`
- an explicit note that this phase does not implement full row link semantics

### Explicit Non-Goals

This phase should not attempt to solve:

- `href`, `target`, or router-aware row navigation APIs
- native-link-equivalent semantics for rows
- nested buttons, links, inputs, or menus inside arbitrary body cells
- touch-specific long-press selection mode switching

These can be revisited later, but they should not block the collection-level row action API.

### Phase 3 Recommended Implementation Order

1. Add `onRowAction` and `disabledBehavior` to `Table.Root` and root context.
2. Refactor disabled-state helpers into selection-vs-action-aware logic.
3. Refactor row press handling so action and selection are separate pathways, and land basic pointer single-click action tests immediately.
4. Update `Table.Row` and `Table.Cell` keyboard semantics (`Enter` vs `Space`).
5. Add pointer double-click support for `replace` mode only after the basic action pipeline is covered by tests.
6. Update `Table.Checkbox` for selection-only disabled rows.
7. Add regression tests for the full matrix, including callback ordering and disabled-row keyboard action coverage.
8. Document examples and caveats, especially the dynamic `toggle`-mode switch, callback ordering in `replace`, and the non-goal of row link semantics.

## Recommended Next Step

Turn this plan into a more concrete API specification, part by part and prop by prop, before creating implementation files.
