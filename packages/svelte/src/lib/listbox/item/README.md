# ListBox Item

## API reference

### ListBox.Item

Name: `ListBox.Item`  
Description: Selectable option element with built-in selected, focused, hovered, and disabled states.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string \| number` | `required` | Unique id for option registration and selection. |
| `textValue` | `string` | `content text` | String used for text resolution and typeahead. |
| `disabled` | `boolean` | `false` | Disables item interaction. |
| `class` | `string` | `''` | CSS class names for the item. |
| `children` | `Snippet` | `undefined` | Rendered item content. |
| `customId` | `string` | ``listbox-item-${id}`` | Overrides generated DOM id. |
| `disableFocusHandling` | `boolean` | `false` | Disables internal DOM focus behavior. |
| `isFocusedOverride` | `boolean` | `undefined` | Forces focused state from parent composition. |
| `onItemSelect` | `(id, label) => void` | `undefined` | Custom selection callback override. |
| `onResolvedTextValue` | `(label: string) => void` | `undefined` | Called when item text value is resolved. |
| `scrollOnFocus` | `boolean` | `false` | Scrolls item into view when focused. |
| `isParentDisabled` | `boolean` | `false` | Additional disabled state inherited from parent wrapper. |
| `...restProps` | `HTMLAttributes<HTMLDivElement>` | `-` | Additional option attributes. |
