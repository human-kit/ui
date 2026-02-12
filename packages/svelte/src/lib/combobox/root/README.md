# ComboBox Root API Reference

## Section
- Name: `ComboBox.Root`
- Description: Estado principal del combobox. Controla input, apertura, navegacion, seleccion y sincronizacion con subcomponentes.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `$props.id()` | Id estable para ids ARIA internos (recomendado en SSR). |
| `isDisabled` | `boolean` | `false` | Deshabilita interaccion completa. |
| `isReadOnly` | `boolean` | `false` | Evita cambios de valor manteniendo foco/lectura. |
| `value` | `string | number | (string | number)[]` | `undefined` | Valor controlado de seleccion. Compatible con `bind:value`. |
| `defaultValue` | `string | number | (string | number)[]` | `undefined` | Valor inicial en modo no controlado. |
| `inputValue` | `string` | `undefined` | Valor controlado del input. Compatible con `bind:inputValue`. |
| `defaultInputValue` | `string` | `''` | Valor inicial del input en modo no controlado. |
| `selectionBehavior` | `'toggle' | 'replace'` | `'toggle'` | Comportamiento de seleccion al elegir items. |
| `selectionMode` | `'single' | 'multiple'` | `'single'` | Modo de seleccion del combobox. |
| `closeOnSelect` | `boolean` | `single: true / multiple: false` | Define si el popover cierra despues de seleccionar. |
| `isOpen` | `boolean` | `undefined` | Estado controlado de apertura. Compatible con `bind:isOpen`. |
| `trigger` | `'focus' | 'input' | 'press'` | `'press'` | Mecanismo principal para abrir el popover. |
| `onInputChange` | `(value: string) => void` | `undefined` | Callback al cambiar texto del input. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback al cambiar apertura. |
| `onChange` | `(value) => void` | `undefined` | Callback al cambiar seleccion externa. |
| `items` | `T[]` | `undefined` | Items para render dinamico desde `ComboBox.List`. |
| `renderItem` | `Snippet<[T]>` | `undefined` | Snippet de render por item para modo dinamico. |
| `children` | `Snippet` | `undefined` | Arbol de subcomponentes del combobox. |
| `class` | `string` | `''` | Clases CSS del wrapper raiz. |
| `aria-label` | `string` | `undefined` | Etiqueta accesible del grupo. |
| `aria-labelledby` | `string` | `undefined` | Id del label externo del grupo. |

## Section
- Name: `context.ts` utilities
- Description: Helpers para proveer y consumir el estado compartido de combobox.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `setComboBoxContext` | `(ctx: ComboBoxContext) => void` | `-` | Registra el contexto en `ComboBox.Root`. |
| `getComboBoxContext` | `() => ComboBoxContext | undefined` | `-` | Obtiene el contexto si existe. |
| `useComboBoxContext` | `() => ComboBoxContext` | `-` | Obtiene el contexto y lanza error fuera de `ComboBox.Root`. |
| `ComboBoxContext` | `type` | `-` | Contrato completo de estado y acciones del combobox. |
