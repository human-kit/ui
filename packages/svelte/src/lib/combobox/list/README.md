# ComboBox List

## API reference

### ComboBox.List

Name: `ComboBox.List`  
Description: Listbox bridge for combobox options. It delegates selection state and mode to `ComboBox.Root`.

| Prop              | Type                                                | Default     | Description                                                                     |
| ----------------- | --------------------------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `aria-label`      | `string`                                            | `'Options'` | Accessible label for the internal listbox.                                      |
| `items`           | `Iterable<T>`                                       | `ctx.items` | Dynamic data source. If omitted, uses items from root context.                  |
| `children`        | `Snippet<[T]> \| Snippet`                           | `undefined` | Dynamic item renderer or static list content.                                   |
| `...listBoxProps` | `Omit<ComponentProps<ListBoxRoot>, internal props>` | `-`         | Additional listbox props such as `class`, `emptyPlaceholder`, or `disabledKeys`. |

### Internally controlled props

Name: Controlled by `ComboBox.Root`  
Description: The following values are set by `ComboBox.List` and should not be overridden directly.

| Prop            | Type                     | Default                          | Description                                           |
| --------------- | ------------------------ | -------------------------------- | ----------------------------------------------------- |
| `selectionMode` | `'single' \| 'multiple'` | `ctx.selectionMode`              | Selection mode inherited from root.                   |
| `value`         | `Set<string \| number>`  | `ctx.selectedValue`              | Current combobox selection state.                     |
| `onChange`      | `(selection) => void`    | `internal handler`               | Delegates selected item handling to combobox context. |
| `id`            | `string`                 | `combobox-listbox-${instanceId}` | Auto-generated listbox id for ARIA wiring.            |
