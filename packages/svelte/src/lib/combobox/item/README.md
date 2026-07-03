# ComboBox Item

## API reference

### ComboBox.Item

Name: `ComboBox.Item`  
Description: Selectable option item with combobox-specific filtering, virtual focus, and registration logic.

| Prop            | Type                             | Default        | Description                                                    |
| --------------- | -------------------------------- | -------------- | -------------------------------------------------------------- |
| `id`            | `string \| number`               | `required`     | Unique item id used for selection and ARIA relationships.      |
| `textValue`     | `string`                         | `content text` | Text used for filtering and fallback label resolution.         |
| `disabled`      | `boolean`                        | `false`        | Marks the item as disabled and non-selectable.                 |
| `onAction`      | `ComboBoxItemActionHandler`      | `undefined`    | Called instead of selecting when the item is activated.        |
| `closeOnAction` | `boolean`                        | `true`         | Whether to close the popover after `onAction` runs.            |
| `class`         | `string`                         | `undefined`    | CSS class names for the item.                                  |
| `children`      | `Snippet`                        | `undefined`    | Rendered item content.                                         |
| `...restProps`  | `HTMLAttributes<HTMLDivElement>` | `-`            | Additional attributes passed to the underlying option element. |

### Action items

Use `onAction` for command-style items such as creating a new value. Action items keep the
combobox value unchanged, work with click and `Enter`, and close the popover by default. Set
`filterActionItems={false}` on `ComboBox.Root` when an action should stay visible regardless of
the current filter text.

```svelte
<script lang="ts">
	let inputValue = $state('');

	function createItem(value: string) {
		// Create the item in application state.
	}
</script>

<ComboBox.Root bind:inputValue filterActionItems={false}>
	<ComboBox.Input />

	<ComboBox.Popover>
		<ComboBox.List emptyPlaceholder="No results">
			<ComboBox.Item
				id="create"
				textValue="Create item"
				disabled={!inputValue.trim()}
				onAction={({ inputValue }) => createItem(inputValue)}
			>
				{#if inputValue.trim()}
					Create "{inputValue}"
				{:else}
					Create item
				{/if}
			</ComboBox.Item>
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>
```

### Item context utility

Name: `COMBOBOX_ITEM_CONTEXT_KEY` / `ComboBoxItemContext`  
Description: Internal context consumed by `ComboBox.ItemIndicator` to read the parent item id.

| Prop                        | Type               | Default                       | Description                               |
| --------------------------- | ------------------ | ----------------------------- | ----------------------------------------- |
| `COMBOBOX_ITEM_CONTEXT_KEY` | `symbol`           | `Symbol.for('combobox-item')` | Context key shared by item and indicator. |
| `id`                        | `string \| number` | `required`                    | Current item id exposed through context.  |
