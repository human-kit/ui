# Tree.CheckboxIndicator

## API reference

### Tree.CheckboxIndicator

Name: `Tree.CheckboxIndicator`  
Description: Indicator wrapper for `Tree.Checkbox`. It only renders when the checkbox is checked or indeterminate unless `keepMounted` is enabled.

| Prop          | Type      | Default     | Description                                                        |
| ------------- | --------- | ----------- | ------------------------------------------------------------------ |
| `keepMounted` | `boolean` | `false`     | Keeps the indicator mounted when the checkbox is unchecked.        |
| `children`    | `Snippet` | `undefined` | Indicator content, typically an icon.                              |
| `class`       | `string`  | `''`        | CSS class names for the indicator wrapper.                         |

## Usage notes

- Use `Tree.CheckboxIndicator` inside `Tree.Checkbox`.
- The part forwards generic checkbox state data attributes for styling hooks.
- `Tree.CheckboxIndicator` is headless and styling-agnostic.

```svelte
<Tree.Checkbox>
	<Tree.CheckboxIndicator>
		<CheckIcon class="h-3.5 w-3.5" />
	</Tree.CheckboxIndicator>
</Tree.Checkbox>
```