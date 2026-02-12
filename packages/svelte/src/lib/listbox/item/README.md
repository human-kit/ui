# ListBox Item API Reference

## Section
- Name: `ListBox.Item`
- Description: Opcion individual del listbox con seleccion, foco, hover y soporte para composicion avanzada.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string | number` | `required` | Identificador unico del item. |
| `textValue` | `string` | `content text` | Texto para busqueda/typeahead y labels internos. |
| `disabled` | `boolean` | `false` | Marca el item como deshabilitado. |
| `class` | `string` | `''` | Clases CSS del item. |
| `children` | `Snippet` | `undefined` | Contenido visual del item. |
| `customId` | `string` | ``listbox-item-${id}`` | Sobrescribe el id HTML generado. |
| `disableFocusHandling` | `boolean` | `false` | Desactiva manejo de foco DOM del item. |
| `isFocusedOverride` | `boolean` | `undefined` | Fuerza estado de foco desde composicion externa. |
| `onItemSelect` | `(id, label) => void` | `undefined` | Handler custom de seleccion. |
| `onResolvedTextValue` | `(label: string) => void` | `undefined` | Callback con texto resuelto del item al montar. |
| `scrollOnFocus` | `boolean` | `false` | Hace scroll del item al enfocarse. |
| `isParentDisabled` | `boolean` | `false` | Estado disabled adicional proveniente de componente padre. |
| `...restProps` | `HTMLAttributes<HTMLDivElement>` | `-` | Props HTML extra del elemento option. |
