# ComboBox List API Reference

## Section
- Name: `ComboBox.List`
- Description: Envoltura de `ListBox.Root` controlada por `ComboBox.Root` para renderizar opciones estaticas o dinamicas.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `aria-label` | `string` | `'Options'` | Etiqueta accesible del listbox interno. |
| `items` | `Iterable<T>` | `ctx.items` | Coleccion de items para render dinamico. Si no se pasa, usa `items` del root. |
| `children` | `Snippet<[T]> | Snippet` | `undefined` | Snippet de render de items o contenido estatico. |
| `...listBoxProps` | `Omit<ComponentProps<ListBoxRoot>, controlled props>` | `-` | Props extra de ListBox (ej. `class`, `emptyPlaceholder`, `disabledIds`). |

## Section
- Name: Controlled internally
- Description: Estas props se calculan en `ComboBox.List` y no deben pasarse manualmente.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `selectionMode` | `'single' | 'multiple'` | `ctx.selectionMode` | Modo de seleccion sincronizado con el root. |
| `value` | `Set<string | number>` | `ctx.selectedValue` | Seleccion actual del combobox. |
| `onChange` | `(selection) => void` | `internal handler` | Handler que delega seleccion al contexto de ComboBox. |
| `id` | `string` | ``combobox-listbox-${instanceId}`` | Id ARIA generado automaticamente. |
