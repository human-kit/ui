<!-- markdownlint-disable MD010 -->

# Table

## Description

`Table` is a headless interactive table primitive with grid-style keyboard navigation, row selection, explicit sortable header triggers, and a composable part-based API.

The table barrel exports the prop types of each public Table part.

These are `TableRootProps`, `TableColumnProps`, `TableHeaderProps`, `TableBodyProps`,
`TableFooterProps`, `TableRowProps`, `TableColumnHeaderCellProps`, `TableSortTriggerProps`,
`TableColumnResizerProps`, `TableCellProps`, `TableEmptyStateProps`, `TableCheckboxProps`,
and `TableCheckboxIndicatorProps`.

## Anatomy

```svelte
<Table.Root aria-label="Users table">
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
			<Table.Column id="email" rowHeader>
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group">
				<Table.ColumnHeaderCell>
					<Table.SortTrigger aria-label="Group sort button">
						{#snippet children({ sortDirection })}
							Sort group
							<span class="sr-only">{sortDirection ?? 'not sorted'}</span>
						{/snippet}
					</Table.SortTrigger>
				</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="size" minWidth={120}>
				<Table.ColumnHeaderCell>
					Size
					<Table.ColumnResizer />
				</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		<Table.Row id="danilo">
			<Table.Cell>
				<Table.Checkbox>
					<Table.CheckboxIndicator>
						<CheckIcon />
					</Table.CheckboxIndicator>
				</Table.Checkbox>
			</Table.Cell>
			<Table.Cell>danilo@example.com</Table.Cell>
			<Table.Cell>Developer</Table.Cell>
		</Table.Row>
		<Table.EmptyState>No users found.</Table.EmptyState>
	</Table.Body>

	<Table.Footer>
		<Table.Row>
			<Table.Cell />
			<Table.Cell>Total</Table.Cell>
			<Table.Cell>1 user</Table.Cell>
		</Table.Row>
	</Table.Footer>
</Table.Root>
```

- `Table.Root`
- `Table.Column`
- `Table.Header`
- `Table.Body`
- `Table.EmptyState`
- `Table.Footer`
- `Table.Row`
- `Table.ColumnHeaderCell`
- `Table.SortTrigger`
- `Table.ColumnResizer`
- `Table.Checkbox`
- `Table.CheckboxIndicator`
- `Table.Cell`
- `Table.InteractiveCell`

## Usage guidelines

- Use `Table.Root` as the stateful container for focus, selection, and sorting state.
- Use `keyboardNavigation` to choose how far the roving tab stop reaches into the body: `'grid'` (default) makes every body cell a focus target, `'row'` makes the row the only one, and `'none'` leaves the body inert. The cell navigation has a cost: one focus registration and one focus state for each cell. A virtualized table does this again for each row that it makes. Use `'row'` when the body is a list, and not a surface where the user works. Use `'none'` only when nothing in the body does an action. The header keeps its own navigation in every mode.
- Use `selectionBehavior="toggle"` to let the user remove the selection of a selected row. Use `selectionBehavior="replace"` to keep a selected row selected when the user presses it again.
- `Table.Column` is a logical-only wrapper for column metadata; it does not render DOM by itself and should wrap a single `Table.ColumnHeaderCell`.
- Wrap each header cell in `Table.Column` so the table can register stable column metadata.
- Add `Table.ColumnResizer` inside `Table.ColumnHeaderCell` to make the owning `Table.Column` resizable.
- Provide `aria-label` or `aria-labelledby` on `Table.Root`.
- Use `selectedKeys` / `onSelectionChange` for controlled row selection.
- Use `defaultSelectedKeys` for uncontrolled initial row selection.
- Use `sortDescriptor` / `onSortChange` for controlled sorting state.
- Use `defaultSortDescriptor` for uncontrolled initial sort state.
- Use `hiddenColumns` for controlled column visibility when consumers need to show or hide columns without changing the table markup.
- Use `defaultHiddenColumns` for uncontrolled initial column visibility.
- Use `columnWidths` / `onColumnWidthsChange` for controlled column width state. Width specs can be px, `%`, or `fr`.
- Use `defaultColumnWidths` and `Table.Column.defaultWidth` to seed uncontrolled initial widths that can still be resized by the user.
- Use `Table.Column.width` when a column must keep an exact width. A column with a fixed width does not change its width, also with a `Table.ColumnResizer` in it.
- In resizable tables, unspecified columns behave like an implicit `1fr` width before interaction. At the first width change, the component sets each visible column in px. The last column takes the difference, down to its minimum width. After that, the table becomes wider than its container.
- Setting `sortDescriptor` back to `undefined` clears the controlled sort state, matching React Aria Table semantics.
- Set `Table.Column.textValue` when the spoken column label should differ from the column id; `Table.Root` uses it for polite sort announcements.
- Use `Table.EmptyState` inside `Table.Body` instead of conditionally rendering freeform body content.
- Use `Table.Checkbox` when you need explicit selection UI inside cells instead of relying only on row or cell presses.
- Use `Table.CheckboxIndicator` to make your own marks for the checked state and the indeterminate state.
- Use `Table.InteractiveCell` for a body cell that has its own controls. While the focus is on the cell, the grid keyboard operation is the same as in `Table.Cell`. While the focus is on a control in the cell, that control gets the keys and the pointer.
- `Table.Checkbox` auto-hides in header cells unless `selectionMode="multiple"`, and auto-hides everywhere when `selectionMode="none"`.
- A hidden column is not in the grid navigation, not in the column count, and not in the width changes. It keeps its width, thus you can show it again with that width.
- Dedicated utility columns like selection checkboxes should usually set an explicit `width`, `minWidth`, and `maxWidth` on `Table.Column` so sibling resizes do not redistribute their space.
- When `selectionMode` changes to `none`, the component clears any existing row selection internally.
- v1 leaves text selection and `Ctrl+C` behavior browser-native; the table does not implement custom copy handling or force a text-selection policy.
- In `replace` mode, clicking outside the table clears focus but does not clear selection.
- In body rows, pressing `ArrowLeft` before the first cell or `ArrowRight` after the last cell moves focus to the row itself. Repeating that same horizontal arrow loops back into the opposite edge cell of the same row.
- `Table.Checkbox` is the supported interactive control inside table cells for explicit row selection in v1.

## Composition contract

- DOM-rendering parts: `Table.Root`, `Table.Header`, `Table.Body`, `Table.Footer`, `Table.Row`, `Table.Cell`, `Table.InteractiveCell`, `Table.ColumnHeaderCell`, `Table.ColumnResizer`, `Table.Checkbox`, `Table.CheckboxIndicator`, and `Table.EmptyState` all render DOM.
- Metadata-only part: `Table.Column` does not render its own element. It only registers the public column input for the surrounding header composition.
- Sorting: `Table.SortTrigger` is the public opt-in for sortable columns. Rendering it inside `Table.ColumnHeaderCell` makes the owning `Table.Column` sortable and toggles `Table.Root.sortDescriptor`.
- `Table.SortTrigger.children` can consume a `sortDirection` render state so the trigger button can expose stateful labels or visuals without reading the root descriptor directly.
- Resizing: `Table.ColumnResizer` is the only public opt-in for resizing. Rendering it inside a `Table.ColumnHeaderCell` enables resizing for the owning `Table.Column`.
- Public input types: import the `Table*Props` types you need from `@human-kit/ui/table` or the main package barrel instead of deriving contracts from component internals.
- Internal normalized state: table context stores normalized column metadata internally as `TableColumnMetadata`. That metadata is not the public input contract for wrappers or consumers.

## Accessibility

- `Table.Root` renders an interactive `grid` over native table markup.
- Keyboard navigation uses roving `tabindex` across header and body cells.
- Under `keyboardNavigation="row"` the body's roving tab stop sits on the rows: arrows walk rows, `Enter` presses one and `Space` toggles its selection. Focusable content inside body cells becomes a regular tab stop instead, since no roving focus reaches it there.
- A body row can also take the focus when the horizontal navigation goes past the start or the end of the row. If the user continues to push the left key or the right key, the focus goes to the cell at the opposite edge.
- `Table.Checkbox` can receive DOM focus directly while still participating in the table's roving-focus grid.
- First-column body cells become `rowheader` when their associated column has `rowHeader`.
- Disabled rows remain rendered and non-selectable, but are skipped by focus navigation.
- `Table.SortTrigger` renders the trigger button, while the header cell remains the roving-focus target for arrow-key grid navigation.
- Sort changes are mirrored into a polite live region so screen readers announce direction changes more reliably than `aria-sort` alone.
- Column resize handles are keyboard accessible separators. Push `Enter` to start the resize mode. Use the horizontal arrow keys to change the width. Push `Home` for the minimum width, and `End` for the width of the content. Push `Enter` again to leave the resize mode. The focus stays on the handle.
