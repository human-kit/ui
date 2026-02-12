# ComboBox Tags API Reference

## Section
- Name: `ComboBox.Tags`
- Description: Contenedor de tags seleccionados para `selectionMode="multiple"`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Snippet<[{ item: TagItem }]>` | `required` | Snippet que renderiza cada tag con `{ item: { value, label } }`. |
| `class` | `string` | `''` | Clases CSS del contenedor de tags. |

## Section
- Name: `TagItem` (type)
- Description: Tipo helper expuesto para el render de items seleccionados.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `value` | `string | number` | `required` | Valor seleccionado. |
| `label` | `string` | `required` | Label visible del tag. |
