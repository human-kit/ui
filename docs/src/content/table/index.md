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

This is a headless table that the user can operate. The keyboard moves through it like a grid. The user can select rows and can sort a column with a trigger in its header. You assemble the table from parts.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Table.Root` makes an interactive `grid` above native table markup. Put each header cell in a `Table.Column`. That part has no DOM of its own — it only registers the column. To make a column sortable or resizable, put a `Table.SortTrigger` or a `Table.ColumnResizer` in its `Table.ColumnHeaderCell`.

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

Set `selectionMode="multiple"` or `selectionMode="single"`, and give each body row an `id`. Put `Table.Checkbox` and `Table.CheckboxIndicator` in a cell to make the control that the user sees. The checkbox in the header selects all of the rows, and it shows an indeterminate state. The `disabledKeys` prop keeps a row in the table, but the user cannot select it.

<Demo source={selectionSource}><Selection /></Demo>

## Keyboard navigation

The `keyboardNavigation` prop sets how far the roving tab stop goes into the body. The default is `"grid"`, the full ARIA grid pattern, where each body cell can take the focus. This has a cost. Each cell registers itself and calculates its own focus state. A virtualized table does this again for each row that it makes while the user scrolls.

- `"grid"` — the arrow keys move from cell to cell. Use this mode when the user works in the body, and does not only read it.
- `"row"` — the row is the only element in the body that takes the focus. The arrow keys move from row to row, the `Enter` key presses a row, and the `Space` key selects a row. There is one focus target for each row, not one for each cell. An element in a body cell that can take the focus becomes a usual tab stop, for example a `Table.Checkbox` or a link. The roving focus does not go to it.
- `"none"` — the keyboard does not go into the body. Use this mode only when nothing in the body does an action. A row that obeys a click needs an equivalent keyboard operation.

In each mode, the header keeps its own cell navigation. Thus the sort control and the resize control stay available. The header is one row, thus its cost is very small.

## Pagination

The table does not do the pagination. Cut the data before you make the table, and control the current page from your own controls or from the state of your application.

## Usage guidelines

- Use `Table.Root` as the container with the state for the focus, the selection, and the sort. Give it an `aria-label` or an `aria-labelledby` attribute.
- Put each header cell in a `Table.Column`, thus the table can register stable data about the column. `Table.Column` makes no DOM of its own.
- Use `selectedKeys` and `onSelectionChange` when your own code controls the selection. Use `defaultSelectedKeys` for the initial selection when the component controls it.
- Use `selectionBehavior="toggle"` to let the user remove the selection of a selected row. Use `"replace"` to keep a selected row selected when the user presses it again.
- Use `sortDescriptor` and `onSortChange` when your own code controls the sort. Use `defaultSortDescriptor` for the initial sort when the component controls it. A `Table.SortTrigger` in a header cell makes that column sortable.
- Use `columnWidths` and `onColumnWidthsChange` when your own code controls the widths of the columns. A width can be in px, in `%`, or in `fr`. Put a `Table.ColumnResizer` in a `Table.ColumnHeaderCell` to make that column resizable.
- Give a utility column, for example a column of selection checkboxes, an explicit `width`, `minWidth`, and `maxWidth` on its `Table.Column`. Thus a resize of a different column does not change its space.
- Use `Table.EmptyState` in `Table.Body`. Do not make your own body content with a condition.
- Use `Table.InteractiveCell` for a body cell that contains its own controls that take the focus.

## Accessibility

- `Table.Root` makes an interactive `grid` above native table markup. The keyboard operation uses a roving `tabindex` across the header cells and the body cells.
- `keyboardNavigation="row"` moves that roving tab stop from the cells to the rows. This is a permitted grid focus pattern. `"none"` removes the tab stop from the body, thus use it only for a table where the rows do nothing.
- A body row can also take the focus when the horizontal navigation goes past the start or the end of the row. If the user continues to push the left key or the right key, the focus goes to the cell at the opposite edge.
- A body cell in the first column becomes a `rowheader` when its column has `rowHeader`.
- A disabled row stays in the table and the user cannot select it. The focus does not stop on it.
- `Table.SortTrigger` makes the trigger button, but the header cell stays the roving focus target. The component writes each sort change into a polite live region for a screen reader.
- A column resize handle is a keyboard-accessible separator. Push `Enter` to start the resize mode. Use the horizontal arrow keys to change the width. Push `Home` for the minimum width. Push `End` for the automatic width. Push `Enter` again to leave the resize mode.

## API reference

<ApiReference api={api} />

The same parts also give you the more complex patterns. These are the visibility of a column, fixed and pinned columns, a header that stays at the top, a column resize, and row actions. The API reference above has the props for them.
