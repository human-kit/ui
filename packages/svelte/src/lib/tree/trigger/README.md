# Tree.Trigger

## API reference

### Tree.Trigger

Name: `Tree.Trigger`  
Description: Optional toggle button that wires expansion state to the owning `Tree.Item` when that item has `Tree.Children`.

| Prop       | Type      | Default     | Description                                                     |
| ---------- | --------- | ----------- | --------------------------------------------------------------- |
| `children` | `Snippet` | `undefined` | Trigger button content rendered inside the button root.          |

## Usage notes

- Use `Tree.Trigger` directly inside `Tree.Item`.
- Clicking the trigger toggles expansion without invoking the item's selection press.
- `Tree.Trigger` renders `Button.Root` internally, manages `tabindex="-1"` automatically, and only renders when the owning item has children.
- `Tree.Trigger` is headless and styling-agnostic.

```svelte
<Tree.Item id="documents" title="Documents">
	<Tree.Trigger aria-label="Toggle Documents">
		<ChevronRightIcon />
	</Tree.Trigger>
	<Tree.Label>Documents</Tree.Label>
	<Tree.Children>
		<Tree.Item id="reports" title="Reports">
			<Tree.Label>Reports</Tree.Label>
		</Tree.Item>
	</Tree.Children>
</Tree.Item>
```