# ComboBox Tag

## API reference

### ComboBox.Tag

Name: `ComboBox.Tag`  
Description: Visual token representing one selected value in multiple selection mode.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Snippet` | `required` | Tag content. |
| `class` | `string` | `undefined` | CSS class names for the tag element. |
| `...restProps` | `HTMLAttributes<HTMLSpanElement>` | `-` | Additional span attributes. |

### TagContextProvider (utility)

Name: `TagContextProvider`  
Description: Internal provider used by `ComboBox.Tags` to expose `id`, `label`, `remove`, and `disabled` to tag sub-parts.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string \| number` | `required` | Selected item id. |
| `label` | `string` | `required` | Selected item label. |
| `remove` | `() => void` | `required` | Removes the selected item. |
| `disabled` | `boolean` | `required` | Disabled state propagated to tag parts. |
| `children` | `Snippet` | `required` | Wrapped tag subtree. |

### Tag context exports

Name: `TAG_CONTEXT_KEY` / `TagContext`  
Description: Shared context key and type consumed by `ComboBox.Tag` and `ComboBox.TagRemove`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `TAG_CONTEXT_KEY` | `symbol` | `Symbol.for('combobox-tag')` | Global context key for tag state. |
| `TagContext` | `type` | `-` | Type with `id`, `label`, `remove`, and `disabled`. |
