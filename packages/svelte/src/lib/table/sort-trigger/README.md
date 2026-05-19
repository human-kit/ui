<!-- markdownlint-disable MD024 -->

# Table.SortTrigger

## API reference

### Table.SortTrigger

Name: `Table.SortTrigger`
Description: Button trigger that makes the owning `Table.Column` sortable. It must be composed inside `Table.ColumnHeaderCell`.

Public prop type: `TableSortTriggerProps`

| Prop           | Type                                                | Default     | Description                                                                       |
| -------------- | --------------------------------------------------- | ----------- | --------------------------------------------------------------------------------- |
| `children`     | `Snippet<[TableSortTriggerRenderState]> \| Snippet` | `undefined` | Button content. The snippet receives the current `sortDirection`.                 |
| `class`        | `string`                                            | `''`        | CSS class names for the button.                                                   |
| `...restProps` | `HTMLButtonAttributes`                              | `-`         | Additional native button attributes, excluding reserved trigger button semantics. |

## Usage notes

- `Table.SortTrigger` must be used inside `Table.ColumnHeaderCell`.
- Rendering `Table.SortTrigger` inside `Table.ColumnHeaderCell` is enough to make the owning `Table.Column` sortable.
- The trigger resolves the active column from `Table.Column` context. It does not accept a separate `columnId` prop.
- `Table.SortTrigger` renders the actual button and wires sorting behavior plus sort-state data attributes onto it.
- `children` can read the current `sortDirection` render state to adjust labels or icons without reaching into `Table.Root.sortDescriptor`.
- The header cell remains the roving-focus target for arrow-key grid navigation; use `Tab` to move into the trigger button.
- Use separate controls for secondary header actions such as filter popovers or menus.

```svelte
<Table.Column id="group" textValue="Group">
	<Table.ColumnHeaderCell>
		<Table.SortTrigger
			class="inline-flex items-center gap-2 rounded-sm"
			aria-label="Group sort button"
		>
			{#snippet children({ sortDirection })}
				<span>Sort group</span>
				<SortIcon data-direction={sortDirection} />
			{/snippet}
		</Table.SortTrigger>
	</Table.ColumnHeaderCell>
</Table.Column>
```
