# Checkbox Indicator

## API reference

### Checkbox.Indicator

Name: `Checkbox.Indicator`  
Description: Headless presence wrapper for checkbox indicator content. It renders when the checkbox is checked or indeterminate.

| Prop           | Type                              | Default     | Description                                                              |
| -------------- | --------------------------------- | ----------- | ------------------------------------------------------------------------ |
| `keepMounted`  | `boolean`                         | `false`     | Keeps the indicator mounted while hidden when the checkbox is unchecked. |
| `children`     | `Snippet`                         | `undefined` | Rendered indicator content, such as a check or dash icon.                |
| `class`        | `string`                          | `''`        | CSS class names for the indicator wrapper.                               |
| `...restProps` | `HTMLAttributes<HTMLSpanElement>` | `-`         | Additional attributes forwarded to the indicator span.                   |

```svelte
<Checkbox.Root aria-label="Select row">
	<Checkbox.Indicator>
		<CheckIcon />
	</Checkbox.Indicator>
</Checkbox.Root>
```
