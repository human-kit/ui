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
- register column resize metadata in context when enabled
- serve as the anchor for sorting and row header semantics
- serve as the anchor for width/resizing behavior

Tentative API:

- `id: string` — stable column identity
- `allowsSorting?: boolean`
- `allowsResizing?: boolean`
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
| Column resizing                        | width state, handles, pointer + keyboard, persistence      | high       | next planned phase |
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
			<Table.Column
				id="email"
				isRowHeader
				allowsSorting
				allowsResizing
				defaultWidth={280}
				minWidth={180}
			>
				<Table.ColumnHeaderCell>
					<span>Email</span>
					<Table.ColumnResizer />
				</Table.ColumnHeaderCell>
			</Table.Column>

			<Table.Column
				id="group"
				allowsSorting
				allowsResizing
				defaultWidth={180}
				minWidth={140}
			>
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

#### Resize Props on `Table.Column`

Add the following props:

- `allowsResizing?: boolean`
- `width?: number | string`
- `defaultWidth?: number | string`
- `minWidth?: number`
- `maxWidth?: number`

Notes:

- `width` is the controlled width for the column.
- `defaultWidth` is the uncontrolled initial width.
- `allowsResizing` is required for resize behavior, even if a `Table.ColumnResizer` is rendered.
- `Table.ColumnResizer` without `allowsResizing` should be ignored in production and warn in dev.

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

- `allowsResizing`
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

- `packages/svelte/src/lib/table/column-resizer/table-column-resizer.svelte`
- `packages/svelte/src/lib/table/column-resizer/README.md`
- `packages/svelte/src/lib/table/column-resizer/table-column-resizer.test.ts`

Planned touched files:

- `packages/svelte/src/lib/table/index.parts.ts`
- `packages/svelte/src/lib/table/index.ts`
- `packages/svelte/src/lib/table/root/context.ts`
- `packages/svelte/src/lib/table/root/table-root.svelte`
- `packages/svelte/src/lib/table/column/table-column.svelte`
- `packages/svelte/src/lib/table/column-header-cell/table-column-header-cell.svelte`
- `packages/svelte/src/lib/table/root/table-root.test.ts`
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

## Recommended Next Step

Turn this plan into a more concrete API specification, part by part and prop by prop, before creating implementation files.
