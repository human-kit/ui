# Checkbox Root

## API reference

### Checkbox.Root

Name: `Checkbox.Root`  
Description: Interactive tri-state checkbox root that owns checked, indeterminate, focus, and hidden input synchronization.

| Prop                    | Type                                | Default       | Description                                                      |
| ----------------------- | ----------------------------------- | ------------- | ---------------------------------------------------------------- |
| `id`                    | `string`                            | `$props.id()` | Stable id used for the hidden input and derived root id.         |
| `name`                  | `string`                            | `undefined`   | Form field name forwarded to the hidden native input.            |
| `value`                 | `string`                            | `'on'`        | Submitted value when the checkbox is checked.                    |
| `isChecked`             | `boolean`                           | `undefined`   | Controlled checked state. Supports `bind:isChecked`.             |
| `defaultChecked`        | `boolean`                           | `false`       | Initial checked state in uncontrolled mode.                      |
| `isIndeterminate`       | `boolean`                           | `undefined`   | Controlled indeterminate state. Supports `bind:isIndeterminate`. |
| `defaultIndeterminate`  | `boolean`                           | `false`       | Initial indeterminate state in uncontrolled mode.                |
| `onCheckedChange`       | `(checked: boolean) => void`        | `undefined`   | Called when the effective checked state changes.                 |
| `onIndeterminateChange` | `(indeterminate: boolean) => void`  | `undefined`   | Called when the effective indeterminate state changes.           |
| `isDisabled`            | `boolean`                           | `false`       | Prevents focus and state changes.                                |
| `isReadOnly`            | `boolean`                           | `false`       | Allows focus but blocks user-driven state changes.               |
| `required`              | `boolean`                           | `false`       | Marks the hidden input as required and exposes `data-required`.  |
| `children`              | `Snippet`                           | `undefined`   | Composed checkbox parts such as `Checkbox.Indicator`.            |
| `class`                 | `string`                            | `''`          | CSS class names for the root element.                            |
| `...restProps`          | `HTMLAttributes<HTMLSpanElement>`   | `-`           | Additional attributes forwarded to the checkbox root span.       |

### Context utilities

Name: `context.ts` helpers  
Description: Internal APIs for publishing and consuming checkbox state.

| Prop                 | Type                                             | Default | Description                                        |
| -------------------- | ------------------------------------------------ | ------- | -------------------------------------------------- |
| `setCheckboxContext` | `(ctx: CheckboxContext) => void`                 | `-`     | Registers the checkbox context in root.            |
| `getCheckboxContext` | `() => CheckboxContext \| undefined`             | `-`     | Returns the context when available.                |
| `useCheckboxContext` | `() => CheckboxContext`                          | `-`     | Returns the context and throws outside root usage. |

`CheckboxState` is the internal state union used by the root context: `'checked' | 'unchecked' | 'indeterminate'`.

```svelte
<Checkbox.Root bind:isChecked bind:isIndeterminate aria-label="Notifications">
  <Checkbox.Indicator>
    <CheckIcon />
  </Checkbox.Indicator>
</Checkbox.Root>
```
