# ComboBox Root

## API reference

### ComboBox.Root

Name: `ComboBox.Root`  
Description: State container for combobox behavior, including open state, input value, selection logic, filtering, and keyboard interaction.

| Prop                | Type                                                                | Default                          | Description                                                    |
| ------------------- | ------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------- |
| `id`                | `string`                                                            | `$props.id()`                    | Stable id used to derive internal ARIA ids.                    |
| `disabled`          | `boolean`                                                           | `false`                          | Stops all of the user interaction.                             |
| `pending`           | `boolean`                                                           | `false`                          | Exposes busy async state on the root via `data-pending`.       |
| `readonly`          | `boolean`                                                           | `false`                          | Keeps the component interactive but prevents value changes.    |
| `value`             | `string \| number \| null \| (string \| number)[]`                  | `null` in single mode            | Controlled selection value. Supports `bind:value`.             |
| `defaultValue`      | `string \| number \| null \| (string \| number)[]`                  | `undefined`                      | Initial selection value in uncontrolled mode.                  |
| `inputValue`        | `string`                                                            | `undefined`                      | Controlled input value. Supports `bind:inputValue`.            |
| `defaultInputValue` | `string`                                                            | `''`                             | Initial input value in uncontrolled mode.                      |
| `selectionBehavior` | `'toggle' \| 'replace'`                                             | `'toggle'`                       | Selection behavior when selecting an option.                   |
| `selectionMode`     | `'single' \| 'multiple'`                                            | `'single'`                       | The selection mode: one selection, or more than one selection. |
| `closeOnSelect`     | `boolean`                                                           | `single: true / multiple: false` | Controls whether the popover closes after selection.           |
| `open`              | `boolean`                                                           | `undefined`                      | The open state. Supports `bind:open`.                          |
| `trigger`           | `'focus' \| 'input' \| 'press'`                                     | `'press'`                        | Opening strategy for the popover.                              |
| `filterActionItems` | `boolean`                                                           | `true`                           | Whether `onAction` items participate in local filtering.       |
| `onInputChange`     | `(value: string) => void`                                           | `undefined`                      | The component calls it when the text in the input changes.     |
| `onOpenChange`      | `(open: boolean) => void`                                           | `undefined`                      | Called when open state changes.                                |
| `onChange`          | `(value: string \| number \| null \| (string \| number)[]) => void` | `undefined`                      | Called when selection changes.                                 |
| `items`             | `T[]`                                                               | `undefined`                      | Optional item collection for dynamic rendering.                |
| `children`          | `Snippet`                                                           | `undefined`                      | The combobox parts that you assemble.                          |
| `class`             | `string`                                                            | `''`                             | The CSS class names of the root group element.                 |
| `aria-label`        | `string`                                                            | `undefined`                      | The accessible name of the combobox group..                    |
| `aria-labelledby`   | `string`                                                            | `undefined`                      | Id of an external labeling element.                            |

### Context utilities

Name: `context.ts` helpers  
Description: Internal and advanced APIs for publishing and consuming combobox state.

| Prop                 | Type                                 | Default | Description                                         |
| -------------------- | ------------------------------------ | ------- | --------------------------------------------------- |
| `setComboBoxContext` | `(ctx: ComboBoxContext) => void`     | `-`     | Registers combobox context in root.                 |
| `getComboBoxContext` | `() => ComboBoxContext \| undefined` | `-`     | Returns context if available.                       |
| `useComboBoxContext` | `() => ComboBoxContext`              | `-`     | Returns context and throws outside `ComboBox.Root`. |
| `ComboBoxContext`    | `type`                               | `-`     | Full context contract for state and actions.        |
