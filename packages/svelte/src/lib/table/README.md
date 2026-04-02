<!-- markdownlint-disable MD010 -->

# Table

## Description

`Table` is a headless interactive table primitive with grid-style keyboard navigation, row selection, sortable column headers, and a composable part-based API.

## Anatomy

```svelte
<Table.Root aria-label="Users table">
	<Table.Header>
		<Table.Row>
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
		<Table.EmptyState>No users found.</Table.EmptyState>
	</Table.Body>

	<Table.Footer>
		<Table.Row>
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
- `Table.Cell`

## Usage guidelines

- Use `Table.Root` as the stateful container for focus, selection, and sorting state.
- Use `selectionBehavior="toggle"` to allow deselecting an already selected row, or `selectionBehavior="replace"` to keep selected rows selected when pressed again.
- `Table.Column` is a logical-only wrapper for column metadata; it does not render DOM by itself and should wrap a single `Table.ColumnHeaderCell`.
- Wrap each header cell in `Table.Column` so the table can register stable column metadata.
- Provide `aria-label` or `aria-labelledby` on `Table.Root`.
- Use `selectedKeys` / `onSelectionChange` for controlled row selection.
- Use `defaultSelectedKeys` for uncontrolled initial row selection.
- Use `sortDescriptor` / `onSortChange` for controlled sorting state.
- Use `defaultSortDescriptor` for uncontrolled initial sort state.
- Use `Table.EmptyState` inside `Table.Body` instead of conditionally rendering freeform body content.
- When `selectionMode` changes to `none`, the component clears any existing row selection internally.
- v1 leaves text selection and `Ctrl+C` behavior browser-native; the table does not implement custom copy handling or force a text-selection policy.
- In `replace` mode, clicking outside the table clears focus but does not clear selection.
- Keep interactive controls inside `Table.Cell` out of scope for the current v1 API.

## Accessibility

- `Table.Root` renders an interactive `grid` over native table markup.
- Keyboard navigation uses roving `tabindex` across header and body cells.
- First-column body cells become `rowheader` when their associated column has `isRowHeader`.
- Disabled rows remain rendered and non-selectable, but are skipped by focus navigation.
