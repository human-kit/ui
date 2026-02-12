# ComboBox Tag API Reference

## Section
- Name: `ComboBox.Tag`
- Description: Tag individual para representar una seleccion en modo multiple.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Snippet` | `required` | Contenido visual del tag. |
| `class` | `string` | `undefined` | Clases CSS del tag. |
| `...restProps` | `HTMLAttributes<HTMLSpanElement>` | `-` | Props HTML adicionales reenviadas al `<span>`. |

## Section
- Name: `TagContextProvider` (utility)
- Description: Componente interno que inyecta en contexto `id`, `label`, `remove` y `disabled` para `ComboBox.Tag` y `ComboBox.TagRemove`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string | number` | `required` | Id del item seleccionado. |
| `label` | `string` | `required` | Label del item seleccionado. |
| `remove` | `() => void` | `required` | Funcion para remover el tag actual. |
| `disabled` | `boolean` | `required` | Estado deshabilitado propagado al tag. |
| `children` | `Snippet` | `required` | Contenido envuelto por el provider. |

## Section
- Name: `TAG_CONTEXT_KEY` / `TagContext`
- Description: Clave y contrato de contexto compartido entre tag y boton de remove.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `TAG_CONTEXT_KEY` | `symbol` | `Symbol.for('combobox-tag')` | Clave global de contexto de tag. |
| `TagContext` | `type` | `-` | Tipo con `id`, `label`, `remove`, `disabled`. |
