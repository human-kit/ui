# ComboBox Item

## API reference

### ComboBox.Item
Name: `ComboBox.Item`  
Description: Selectable option item with combobox-specific filtering, virtual focus, and registration logic.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string | number` | `required` | Unique item id used for selection and ARIA relationships. |
| `textValue` | `string` | `content text` | Text used for filtering and fallback label resolution. |
| `disabled` | `boolean` | `false` | Marks the item as disabled and non-selectable. |
| `class` | `string` | `undefined` | CSS class names for the item. |
| `children` | `Snippet` | `undefined` | Rendered item content. |
| `...restProps` | `HTMLAttributes<HTMLDivElement>` | `-` | Additional attributes passed to the underlying option element. |

### Item context utility
Name: `COMBOBOX_ITEM_CONTEXT_KEY` / `ComboBoxItemContext`  
Description: Internal context consumed by `ComboBox.ItemIndicator` to read the parent item id.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `COMBOBOX_ITEM_CONTEXT_KEY` | `symbol` | `Symbol.for('combobox-item')` | Context key shared by item and indicator. |
| `id` | `string | number` | `required` | Current item id exposed through context. |
