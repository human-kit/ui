<!-- markdownlint-disable MD010 -->

# Table

## Description

`Table` is a headless interactive table primitive with grid-style keyboard navigation, row selection, sortable column headers, and a composable part-based API.

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
			<Table.Column id="email" isRowHeader>
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group" allowsSorting>
				<Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
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
- `Table.ColumnResizer`
- `Table.Checkbox`
- `Table.CheckboxIndicator`
- `Table.Cell`

## Usage guidelines

- Use `Table.Root` as the stateful container for focus, selection, and sorting state.
- Use `selectionBehavior="toggle"` to allow deselecting an already selected row, or `selectionBehavior="replace"` to keep selected rows selected when pressed again.
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
- Use `columnWidths` / `onColumnWidthsChange` for controlled column width state.
- Use `defaultColumnWidths`, `Table.Column.defaultWidth`, and `Table.Column.width` to seed explicit widths.
- Setting `sortDescriptor` back to `undefined` clears the controlled sort state, matching React Aria Table semantics.
- Set `Table.Column.textValue` when the spoken column label should differ from the column id; `Table.Root` uses it for polite sort announcements.
- Use `Table.EmptyState` inside `Table.Body` instead of conditionally rendering freeform body content.
- Use `Table.Checkbox` when you need explicit selection UI inside cells instead of relying only on row or cell presses.
- Use `Table.CheckboxIndicator` to compose your own visual affordance for checked and indeterminate states.
- `Table.Checkbox` auto-hides in header cells unless `selectionMode="multiple"`, and auto-hides everywhere when `selectionMode="none"`.
- Hidden columns are excluded from grid navigation, visible column counts, and active resize behavior, but their registered widths are preserved so they can be restored when shown again.
- Dedicated utility columns like selection checkboxes should usually set an explicit `width`, `minWidth`, and `maxWidth` on `Table.Column` so sibling resizes do not redistribute their space.
- When `selectionMode` changes to `none`, the component clears any existing row selection internally.
- v1 leaves text selection and `Ctrl+C` behavior browser-native; the table does not implement custom copy handling or force a text-selection policy.
- In `replace` mode, clicking outside the table clears focus but does not clear selection.
- In body rows, pressing `ArrowLeft` before the first cell or `ArrowRight` after the last cell moves focus to the row itself. Repeating that same horizontal arrow loops back into the opposite edge cell of the same row.
- `Table.Checkbox` is the supported interactive control inside table cells for explicit row selection in v1.

## Accessibility

- `Table.Root` renders an interactive `grid` over native table markup.
- Keyboard navigation uses roving `tabindex` across header and body cells.
- Body rows can also become the active focus target when horizontal navigation moves past the start or end of a row, and repeated left/right navigation loops back into the opposite edge cell.
- `Table.Checkbox` can receive DOM focus directly while still participating in the table's roving-focus grid.
- First-column body cells become `rowheader` when their associated column has `isRowHeader`.
- Disabled rows remain rendered and non-selectable, but are skipped by focus navigation.
- Sort changes are mirrored into a polite live region so screen readers announce direction changes more reliably than `aria-sort` alone.
- Column resize handles are keyboard accessible separators. Press `Enter` to enter resize mode, use the horizontal arrow keys to resize, `Home` to jump to the minimum width, `End` to auto-fit to content width, and press `Enter` again to exit resize mode while keeping focus on the handle.
