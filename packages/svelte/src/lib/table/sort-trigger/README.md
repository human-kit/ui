<!-- markdownlint-disable MD024 -->

# Table.SortTrigger

## API reference

### Table.SortTrigger

Name: `Table.SortTrigger`
Description: Headless wrapper that makes the owning `Table.Column` sortable. It must be composed inside `Table.ColumnHeaderCell` and contain a `button` or `[role="button"]` child that acts as the actual trigger element.

Public prop type: `TableSortTriggerProps`

| Prop       | Type                                                | Default     | Description                                                                                                                |
| ---------- | --------------------------------------------------- | ----------- | -------------------------------------------------------------------------------------------------------------------------- |
| `children` | `Snippet<[TableSortTriggerRenderState]> \| Snippet` | `undefined` | Child content that includes the actual trigger button or role=button UI. The snippet receives the current `sortDirection`. |

## Usage notes

- `Table.SortTrigger` must be used inside `Table.ColumnHeaderCell`.
- Rendering `Table.SortTrigger` inside `Table.ColumnHeaderCell` is enough to make the owning `Table.Column` sortable.
- The trigger resolves the active column from `Table.Column` context. It does not accept a separate `columnId` prop.
- The wrapper finds the first nested `button` or `[role="button"]` and wires sorting behavior plus sort-state data attributes onto that element.
- `children` can read the current `sortDirection` render state to adjust accessible labels or icons without reaching into `Table.Root.sortDescriptor`.
- The header cell remains the roving-focus target for arrow-key grid navigation; use `Tab` to move into the nested trigger button.
- Use separate controls for secondary header actions such as filter popovers or menus.

```svelte
<Table.Column id="group" textValue="Group">
	<Table.ColumnHeaderCell>
		<Table.SortTrigger>
			{#snippet children({ sortDirection })}
				<button
					type="button"
					class="inline-flex items-center gap-2 rounded-sm"
					aria-label={`Group sort button. ${sortDirection ?? 'not sorted'}.`}
				>
					<span>Sort group</span>
					<SortIcon data-direction={sortDirection} />
				</button>
			{/snippet}
		</Table.SortTrigger>
	</Table.ColumnHeaderCell>
</Table.Column>
```
