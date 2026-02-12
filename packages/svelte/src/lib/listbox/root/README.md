# ListBox Root API Reference

## Section
- Name: `ListBox.Root`
- Description: Contenedor principal del listbox. Gestiona seleccion, foco, registro de items y keyboard navigation.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `selectionBehavior` | `'toggle' | 'replace'` | `'toggle'` | Define si un item seleccionado puede deseleccionarse. |
| `emptyPlaceholder` | `string | Snippet` | `'No items selected'` | Placeholder mostrado cuando no hay items. |
| `items` | `Iterable<T>` | `undefined` | Fuente de items para render dinamico. |
| `disabledIds` | `Iterable<string | number>` | `undefined` | Coleccion de ids deshabilitados. |
| `selectionMode` | `'single' | 'multiple'` | `'single'` | Modo de seleccion. |
| `value` | `Iterable<string | number>` | `undefined` | Seleccion controlada. |
| `defaultValue` | `Iterable<string | number>` | `undefined` | Seleccion inicial no controlada. |
| `children` | `Snippet | Snippet<[T]>` | `undefined` | Render estatico o dinamico de opciones. |
| `class` | `string` | `''` | Clases CSS del contenedor. |
| `id` | `string` | `undefined` | Id HTML del listbox. |
| `aria-label` | `string` | `undefined` | Etiqueta accesible del listbox. |
| `onChange` | `(value: Set<string | number>) => void` | `undefined` | Callback al cambiar seleccion. |
| `context` | `ListBoxContext` | `bindable` | Exposicion del contexto via bind para composicion avanzada. |
| `element` | `HTMLElement` | `bindable` | Exposicion del elemento raiz via bind. |

## Section
- Name: `context.ts` utilities
- Description: API interna/avanzada para crear y consumir estado de listbox fuera del componente visual.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `createListBoxContext(options)` | `(CreateListBoxContextOptions) => ListBoxContext` | `{}` | Crea contexto de listbox con reglas de seleccion y foco. |
| `useListBoxContext()` | `() => ListBoxContext` | `-` | Recupera el contexto activo; lanza error fuera de `ListBox.Root`. |
| `CreateListBoxContextOptions.selectionMode` | `'single' | 'multiple'` | `'single'` | Modo inicial de seleccion. |
| `CreateListBoxContextOptions.selectionBehavior` | `'toggle' | 'replace'` | `'toggle'` | Politica inicial de seleccion. |
| `CreateListBoxContextOptions.disabledIds` | `Iterable<string | number>` | `undefined` | Ids iniciales deshabilitados. |
| `CreateListBoxContextOptions.initialSelection` | `Set<string | number>` | `new Set()` | Seleccion inicial interna. |
| `CreateListBoxContextOptions.onSelectionChange` | `(selection) => void` | `undefined` | Callback interno de cambios de seleccion. |
