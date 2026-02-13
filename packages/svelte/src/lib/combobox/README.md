# ComboBox

## Description
`ComboBox` combines text input, popover, and listbox behavior into a single accessible selection pattern. It supports single and multiple selection, controlled and uncontrolled state, and keyboard-first interaction.

## Usage guidelines
- Wrap all parts in `ComboBox.Root`.
- Use controlled props (`value`, `inputValue`, `isOpen`) only when external state management is needed.
- Provide a stable `id` in SSR environments to keep ARIA ids deterministic.
- Render `ComboBox.Tags`, `ComboBox.Tag`, and `ComboBox.TagRemove` in multiple mode to expose selected values.
- Choose `trigger="focus"`, `trigger="input"`, or `trigger="press"` based on your opening behavior requirements.

## Anatomy
Import the component and compose its parts:

```svelte
<ComboBox.Root>
	<ComboBox.Input />
	<ComboBox.Button />
	<ComboBox.Popover>
		<ComboBox.List>
			<ComboBox.Item id="1">Option 1</ComboBox.Item>
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>
```

- `ComboBox.Root`
- `ComboBox.Input`
- `ComboBox.Button`
- `ComboBox.Popover`
- `ComboBox.List`
- `ComboBox.Item`
- `ComboBox.ItemIndicator`
- `ComboBox.Tags`
- `ComboBox.Tag`
- `ComboBox.TagRemove`
