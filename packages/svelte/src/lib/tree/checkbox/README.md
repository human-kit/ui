# Tree.Checkbox

## API reference

### Tree.Checkbox

Name: `Tree.Checkbox`  
Description: Headless selection-aware checkbox root for trees. It reflects and toggles the owning `Tree.Item` selection state, including indeterminate branch state when descendant propagation is enabled.

| Prop              | Type      | Default     | Description                                                          |
| ----------------- | --------- | ----------- | -------------------------------------------------------------------- |
| `id`              | `string`  | `undefined` | Optional id forwarded to the composed checkbox root.                 |
| `title`           | `string`  | `undefined` | Optional title forwarded to the composed checkbox root.              |
| `children`        | `Snippet` | `undefined` | Composed child content, typically `Tree.CheckboxIndicator`.          |
| `class`           | `string`  | `''`        | CSS class names for the composed checkbox root element.              |
| `aria-label`      | `string`  | `undefined` | Accessible label override. Defaults to `Select <item label>`.        |
| `aria-labelledby` | `string`  | `undefined` | Accessible label source id when the checkbox should be named by DOM. |

## Usage notes

- Use `Tree.Checkbox` directly inside `Tree.Item`.
- The checkbox only renders when `selectionMode` is not `none`.
- In descendant propagation mode, parent items become indeterminate when part of the subtree is selected.
- `Tree.Checkbox` is headless and unstyled. Apply classes from the consumer or docs layer.

```svelte
<Tree.Item id="documents" title="Documents">
	<Tree.Checkbox
		aria-label="Select Documents"
		class="inline-flex h-5 w-5 items-center justify-center rounded border"
	>
		<Tree.CheckboxIndicator>
			<CheckIcon class="h-3.5 w-3.5" />
		</Tree.CheckboxIndicator>
	</Tree.Checkbox>
	<Tree.Label>Documents</Tree.Label>
</Tree.Item>
```
