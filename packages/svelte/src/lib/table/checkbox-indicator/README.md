# Table.CheckboxIndicator

## API reference

### Indicator Part

Name: `Table.CheckboxIndicator`
Description: Headless presence wrapper for indicator content inside `Table.Checkbox`. It renders when the checkbox is checked or indeterminate.

Public prop type: `TableCheckboxIndicatorProps`

| Prop           | Type                              | Default     | Description                                                                     |
| -------------- | --------------------------------- | ----------- | ------------------------------------------------------------------------------- |
| `keepMounted`  | `boolean`                         | `false`     | Keeps the indicator mounted while hidden when the checkbox is unchecked.        |
| `children`     | `Snippet`                         | `undefined` | Rendered indicator content, such as a check icon or dash icon.                  |
| `class`        | `string`                          | `''`        | CSS class names for the indicator wrapper.                                      |
| `...restProps` | `HTMLAttributes<HTMLSpanElement>` | `-`         | Additional native attributes forwarded to the composed checkbox indicator span. |

## Usage notes

- Use `Table.CheckboxIndicator` inside `Table.Checkbox`.
- The part is headless and unstyled.
- It mirrors the visibility behavior of `Checkbox.Indicator` and renders for checked and indeterminate states.

```svelte
<Table.Checkbox class="inline-flex h-5 w-5 items-center justify-center rounded border">
	<Table.CheckboxIndicator>
		<CheckIcon class="h-3.5 w-3.5" />
	</Table.CheckboxIndicator>
</Table.Checkbox>
```
