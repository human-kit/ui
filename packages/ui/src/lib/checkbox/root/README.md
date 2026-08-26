# Checkbox Root

## API reference

### Checkbox.Root

Name: `Checkbox.Root`  
Description: The root of a checkbox with three states. It holds the checked state, the indeterminate state, and the focus, and it keeps the hidden input correct.

| Prop                    | Type                               | Default       | Description                                                     |
| ----------------------- | ---------------------------------- | ------------- | --------------------------------------------------------------- |
| `id`                    | `string`                           | `$props.id()` | Stable id used for the hidden input and derived root id.        |
| `name`                  | `string`                           | `undefined`   | Form field name forwarded to the hidden native input.           |
| `value`                 | `string`                           | `'on'`        | Submitted value when the checkbox is checked.                   |
| `form`                  | `string`                           | `undefined`   | Form owner id forwarded to the hidden native input.             |
| `checked`               | `boolean`                          | `undefined`   | Controlled checked state. Supports `bind:checked`.              |
| `defaultChecked`        | `boolean`                          | `false`       | Initial checked state in uncontrolled mode.                     |
| `indeterminate`         | `boolean`                          | `undefined`   | Controlled indeterminate state. Supports `bind:indeterminate`.  |
| `defaultIndeterminate`  | `boolean`                          | `false`       | Initial indeterminate state in uncontrolled mode.               |
| `onCheckedChange`       | `(checked: boolean) => void`       | `undefined`   | Called when the effective checked state changes.                |
| `onIndeterminateChange` | `(indeterminate: boolean) => void` | `undefined`   | Called when the effective indeterminate state changes.          |
| `disabled`              | `boolean`                          | `false`       | Prevents focus and state changes.                               |
| `readonly`              | `boolean`                          | `false`       | Allows focus but blocks user-driven state changes.              |
| `required`              | `boolean`                          | `false`       | Marks the hidden input as required and exposes `data-required`. |
| `children`              | `Snippet`                          | `undefined`   | Composed checkbox parts such as `Checkbox.Indicator`.           |
| `class`                 | `string`                           | `''`          | The CSS class names of the root element.                        |
| `...restProps`          | `HTMLAttributes<HTMLSpanElement>`  | `-`           | Additional attributes forwarded to the checkbox root span.      |

### Context utilities

Name: `context.ts` helpers  
Description: Internal APIs for publishing and consuming checkbox state.

| Prop                 | Type                                 | Default | Description                                        |
| -------------------- | ------------------------------------ | ------- | -------------------------------------------------- |
| `setCheckboxContext` | `(ctx: CheckboxContext) => void`     | `-`     | Registers the checkbox context in root.            |
| `getCheckboxContext` | `() => CheckboxContext \| undefined` | `-`     | Returns the context when available.                |
| `useCheckboxContext` | `() => CheckboxContext`              | `-`     | Returns the context and throws outside root usage. |

`CheckboxState` is the internal state union used by the root context: `'checked' | 'unchecked' | 'indeterminate'`.

```svelte
<Checkbox.Root bind:checked bind:indeterminate aria-label="Notifications">
	<Checkbox.Indicator>
		<CheckIcon />
	</Checkbox.Indicator>
</Checkbox.Root>
```
