---
title: Table
description: A headless interactive table primitive with grid-style keyboard navigation, row selection, explicit sortable header triggers, and a composable part-based API.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Selection from './demos/selection.svelte';
	import selectionSource from './demos/selection.svelte?highlight';
	import api from './api.json';
</script>

# Table

A headless interactive table primitive with grid-style keyboard navigation, row selection, explicit sortable header triggers, and a composable part-based API.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Table.Root` renders an interactive `grid` over native table markup. Wrap each header cell in a `Table.Column` — a metadata-only part that registers the column — and opt into sorting or resizing per column by composing `Table.SortTrigger` or `Table.ColumnResizer` inside its `Table.ColumnHeaderCell`.

```svelte
<script>
	import { Table } from '@human-kit/ui';
</script>

<Table.Root aria-label="Users table">
	<Table.Header>
		<Table.Row>
			<Table.Column id="email" rowHeader>
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group">
				<Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		<Table.Row id="danilo">
			<Table.Cell>danilo@example.com</Table.Cell>
			<Table.Cell>Developer</Table.Cell>
		</Table.Row>
		<Table.EmptyState>No users found.</Table.EmptyState>
	</Table.Body>
</Table.Root>
```

## Row selection

Set `selectionMode="multiple"` (or `"single"`) and give every body row an `id`. `Table.Checkbox` and `Table.CheckboxIndicator` compose explicit selection UI inside cells — the header checkbox selects all rows and shows an indeterminate state, while `disabledKeys` keeps specific rows rendered but non-selectable.

<Demo source={selectionSource}><Selection /></Demo>

## Keyboard navigation

`keyboardNavigation` decides how far the roving tab stop reaches into the body. It defaults to `"grid"`, the full ARIA grid pattern, where every body cell is a focus target — which is also its cost: each cell registers itself and derives its own focus state, and a virtualized table pays that again for every row it mounts while scrolling.

- `"grid"` — arrows move cell by cell. Use it when the body is a working surface, not just a list.
- `"row"` — the row is the only focus target in the body: arrows walk rows, `Enter` presses one and `Space` toggles its selection. One focus target per row instead of one per cell. Focusable content inside body cells (a `Table.Checkbox`, a link) becomes a regular tab stop, since no roving focus reaches it any more.
- `"none"` — the body is inert to the keyboard. Only use it when nothing in it is actionable; a row that responds to a click needs a keyboard equivalent.

The header keeps its own cell navigation in every mode, so sorting and column resizing stay reachable — it is a single row, so it costs nothing.

## Pagination

Pagination stays consumer-owned: slice the dataset before rendering and drive the current page from external controls or app state.

## Usage guidelines

- Use `Table.Root` as the stateful container for focus, selection, and sorting state, and give it `aria-label` or `aria-labelledby`.
- Wrap each header cell in `Table.Column` so the table can register stable column metadata; `Table.Column` renders no DOM by itself.
- Use `selectedKeys` / `onSelectionChange` for controlled row selection and `defaultSelectedKeys` for uncontrolled initial selection.
- Use `selectionBehavior="toggle"` to allow deselecting an already selected row, or `"replace"` to keep selected rows selected when pressed again.
- Use `sortDescriptor` / `onSortChange` for controlled sorting and `defaultSortDescriptor` for uncontrolled initial sort state; `Table.SortTrigger` inside a header cell makes the owning column sortable.
- Use `columnWidths` / `onColumnWidthsChange` for controlled column widths (px, `%`, or `fr`), and add `Table.ColumnResizer` inside `Table.ColumnHeaderCell` to make a column resizable.
- Dedicated utility columns like selection checkboxes should usually set an explicit `width`, `minWidth`, and `maxWidth` on `Table.Column` so sibling resizes do not redistribute their space.
- Use `Table.EmptyState` inside `Table.Body` instead of conditionally rendering freeform body content.
- Use `Table.InteractiveCell` for body cells that contain their own focusable controls.

## Accessibility

- `Table.Root` renders an interactive `grid` over native table markup, and keyboard navigation uses roving `tabindex` across header and body cells.
- `keyboardNavigation="row"` moves that roving tab stop from the cells to the rows, which is a supported grid focus pattern; `"none"` removes it from the body altogether, so reserve it for tables whose rows do nothing.
- Body rows can also become the active focus target when horizontal navigation moves past the start or end of a row, and repeated left/right navigation loops back into the opposite edge cell.
- First-column body cells become `rowheader` when their associated column has `rowHeader`.
- Disabled rows remain rendered and non-selectable, but are skipped by focus navigation.
- `Table.SortTrigger` renders the trigger button, while the header cell remains the roving-focus target; sort changes are mirrored into a polite live region for screen readers.
- Column resize handles are keyboard accessible separators: press `Enter` to enter resize mode, use the horizontal arrow keys to resize, `Home` to jump to the minimum width, `End` to auto-fit, and `Enter` again to exit.

## API reference

<ApiReference api={api} />

More advanced patterns — column visibility, fixed and pinned columns, sticky headers, column resizing, and row actions — are supported by the same parts; see the API reference above for the corresponding props.
