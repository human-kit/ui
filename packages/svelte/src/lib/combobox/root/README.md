# ComboBox Root

## API reference

### ComboBox.Root
Name: `ComboBox.Root`  
Description: State container for combobox behavior, including open state, input value, selection logic, filtering, and keyboard interaction.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `id` | `string` | `$props.id()` | Stable id used to derive internal ARIA ids. |
| `isDisabled` | `boolean` | `false` | Disables all user interaction. |
| `isReadOnly` | `boolean` | `false` | Keeps the component interactive but prevents value changes. |
| `value` | `string | number | (string | number)[]` | `undefined` | Controlled selection value. Supports `bind:value`. |
| `defaultValue` | `string | number | (string | number)[]` | `undefined` | Initial selection value in uncontrolled mode. |
| `inputValue` | `string` | `undefined` | Controlled input value. Supports `bind:inputValue`. |
| `defaultInputValue` | `string` | `''` | Initial input value in uncontrolled mode. |
| `selectionBehavior` | `'toggle' | 'replace'` | `'toggle'` | Selection behavior when selecting an option. |
| `selectionMode` | `'single' | 'multiple'` | `'single'` | Single-select or multi-select mode. |
| `closeOnSelect` | `boolean` | `single: true / multiple: false` | Controls whether the popover closes after selection. |
| `isOpen` | `boolean` | `undefined` | Controlled open state. Supports `bind:isOpen`. |
| `trigger` | `'focus' | 'input' | 'press'` | `'press'` | Opening strategy for the popover. |
| `onInputChange` | `(value: string) => void` | `undefined` | Called when the input value changes. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Called when open state changes. |
| `onChange` | `(value) => void` | `undefined` | Called when selection changes. |
| `items` | `T[]` | `undefined` | Optional item collection for dynamic rendering. |
| `renderItem` | `Snippet<[T]>` | `undefined` | Optional item renderer for dynamic mode. |
| `children` | `Snippet` | `undefined` | Composed combobox parts. |
| `class` | `string` | `''` | CSS class names for the root group element. |
| `aria-label` | `string` | `undefined` | Accessible label for the combobox group. |
| `aria-labelledby` | `string` | `undefined` | Id of an external labeling element. |

### Context utilities
Name: `context.ts` helpers  
Description: Internal and advanced APIs for publishing and consuming combobox state.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `setComboBoxContext` | `(ctx: ComboBoxContext) => void` | `-` | Registers combobox context in root. |
| `getComboBoxContext` | `() => ComboBoxContext | undefined` | `-` | Returns context if available. |
| `useComboBoxContext` | `() => ComboBoxContext` | `-` | Returns context and throws outside `ComboBox.Root`. |
| `ComboBoxContext` | `type` | `-` | Full context contract for state and actions. |
