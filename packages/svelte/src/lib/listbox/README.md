# ListBox

## Description
`ListBox` is a headless selectable list primitive with keyboard navigation, single and multiple selection, and controlled or uncontrolled state.

## Usage guidelines
- Use `ListBox.Root` as the container for selection state and keyboard interactions.
- Render each option with `ListBox.Item`.
- Use `value` and `onChange` for controlled selection.
- Use `defaultValue` for uncontrolled initial selection.
- Provide `aria-label` when there is no visible label.

## Anatomy
Import the component and compose its parts:

```svelte
<ListBox.Root aria-label="Options">
	<ListBox.Item id="1">Option 1</ListBox.Item>
</ListBox.Root>
```

- `ListBox.Root`
- `ListBox.Item`
