# ComboBox Tags

## API reference

### ComboBox.Tags

Name: `ComboBox.Tags`  
Description: Container that renders selected values as tags in multiple mode.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Snippet<[{ item: TagItem }]>` | `required` | Render function that receives each selected item as `{ item: { value, label } }`. |
| `class` | `string` | `''` | CSS class names for the tags container. |

### TagItem type

Name: `TagItem`  
Description: Item shape provided to `ComboBox.Tags` render snippet.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string \| number` | `required` | Selected value id. |
| `label` | `string` | `required` | Display label for the selected value. |
