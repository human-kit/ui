# ListBox Root

## API reference

### ListBox.Root
Name: `ListBox.Root`  
Description: Main listbox state container that manages registration, selection, focus, and keyboard navigation.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `selectionBehavior` | `'toggle' | 'replace'` | `'toggle'` | Selection behavior for already selected options. |
| `emptyPlaceholder` | `string | Snippet` | `'No items selected'` | Fallback content when no options are available. |
| `items` | `Iterable<T>` | `undefined` | Dynamic source collection for rendering. |
| `disabledIds` | `Iterable<string | number>` | `undefined` | Option ids that should be disabled. |
| `selectionMode` | `'single' | 'multiple'` | `'single'` | Selection mode for the listbox. |
| `value` | `Iterable<string | number>` | `undefined` | Controlled selection values. |
| `defaultValue` | `Iterable<string | number>` | `undefined` | Initial uncontrolled selection values. |
| `children` | `Snippet | Snippet<[T]>` | `undefined` | Static or dynamic option rendering. |
| `class` | `string` | `''` | CSS class names for the root element. |
| `id` | `string` | `undefined` | DOM id for the listbox element. |
| `aria-label` | `string` | `undefined` | Accessible label for the listbox. |
| `onChange` | `(value: Set<string | number>) => void` | `undefined` | Called when selection changes. |
| `context` | `ListBoxContext` | `bindable` | Exposes context via `bind:context` for advanced composition. |
| `element` | `HTMLElement` | `bindable` | Exposes root element via `bind:element`. |

### Context utilities
Name: `context.ts` helpers  
Description: Low-level APIs for creating and consuming listbox state outside visual composition.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `createListBoxContext(options)` | `(CreateListBoxContextOptions) => ListBoxContext` | `{}` | Creates a listbox context with selection and focus behavior. |
| `useListBoxContext()` | `() => ListBoxContext` | `-` | Returns context and throws outside `ListBox.Root`. |
| `CreateListBoxContextOptions.selectionMode` | `'single' | 'multiple'` | `'single'` | Initial selection mode. |
| `CreateListBoxContextOptions.selectionBehavior` | `'toggle' | 'replace'` | `'toggle'` | Initial selection behavior. |
| `CreateListBoxContextOptions.disabledIds` | `Iterable<string | number>` | `undefined` | Initial disabled ids. |
| `CreateListBoxContextOptions.initialSelection` | `Set<string | number>` | `new Set()` | Initial uncontrolled selection set. |
| `CreateListBoxContextOptions.onSelectionChange` | `(selection) => void` | `undefined` | Callback for selection updates. |
