# ComboBox Item API Reference

## Section
- Name: `ComboBox.Item`
- Description: Item de lista integrado con seleccion del combobox, filtrado por texto y foco virtual.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string | number` | `required` | Identificador unico del item. |
| `textValue` | `string` | `content text` | Texto usado para filtrado y label interno si no se pasa `textValue`. |
| `disabled` | `boolean` | `false` | Marca el item como no seleccionable. |
| `class` | `string` | `undefined` | Clases CSS del item. |
| `children` | `Snippet` | `undefined` | Contenido visual del item. |
| `...restProps` | `HTMLAttributes<HTMLDivElement>` | `-` | Props HTML adicionales reenviadas al item base. |

## Section
- Name: `COMBOBOX_ITEM_CONTEXT_KEY` / `ComboBoxItemContext`
- Description: Contexto interno usado por `ComboBox.ItemIndicator` para conocer el `id` del item padre.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `COMBOBOX_ITEM_CONTEXT_KEY` | `symbol` | `Symbol.for('combobox-item')` | Clave de contexto compartida entre item e indicator. |
| `id` | `string | number` | `required` | Id actual del item expuesto via contexto. |
