# Switch Root

## API reference

### Switch.Root

Name: `Switch.Root`  
Description: Interactive boolean switch root that owns checked, focus, and hidden input synchronization.

| Prop              | Type                              | Default       | Description                                                |
| ----------------- | --------------------------------- | ------------- | ---------------------------------------------------------- |
| `id`              | `string`                          | `$props.id()` | Stable id used for the hidden input and derived root id.   |
| `name`            | `string`                          | `undefined`   | Form field name forwarded to the hidden native input.      |
| `value`           | `string`                          | `'on'`        | Submitted value when the switch is checked.                |
| `form`            | `string`                          | `undefined`   | Form owner id forwarded to the hidden native input.        |
| `checked`         | `boolean`                         | `undefined`   | Controlled checked state. Supports `bind:checked`.         |
| `defaultChecked`  | `boolean`                         | `false`       | Initial checked state in uncontrolled mode.                |
| `onCheckedChange` | `(checked: boolean) => void`      | `undefined`   | Called when the effective checked state changes.           |
| `disabled`        | `boolean`                         | `false`       | Prevents focus and state changes.                          |
| `readonly`        | `boolean`                         | `false`       | Allows focus but blocks user-driven state changes.         |
| `required`        | `boolean`                         | `false`       | Marks the hidden input as required and exposes data state. |
| `children`        | `Snippet`                         | `undefined`   | Composed switch parts such as `Switch.Thumb`.              |
| `class`           | `string`                          | `''`          | CSS class names for the root element.                      |
| `...restProps`    | `HTMLAttributes<HTMLSpanElement>` | `-`           | Additional attributes forwarded to the switch root span.   |

### Context utilities

Name: `context.ts` helpers  
Description: Internal APIs for publishing and consuming switch state.

| Prop               | Type                               | Default | Description                                      |
| ------------------ | ---------------------------------- | ------- | ------------------------------------------------ |
| `setSwitchContext` | `(ctx: SwitchContext) => void`     | `-`     | Registers the switch context in root.            |
| `getSwitchContext` | `() => SwitchContext \| undefined` | `-`     | Returns the context when available.              |
| `useSwitchContext` | `() => SwitchContext`              | `-`     | Returns the context and throws outside root use. |

```svelte
<Switch.Root bind:checked aria-label="Notifications">
	<Switch.Thumb />
</Switch.Root>
```
