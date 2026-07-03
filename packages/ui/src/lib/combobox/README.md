# ComboBox

## Description

`ComboBox` combines text input, popover, and listbox behavior into a single accessible selection pattern. It supports single and multiple selection, controlled and uncontrolled state, keyboard-first interaction, and async pending states.

## Usage guidelines

- Wrap all parts in `ComboBox.Root`.
- Use controlled props (`value`, `inputValue`, `open`) only when external state management is needed.
- Use `pending` on `ComboBox.Root` to expose async loading state on the root while keeping the rest of the composition under your control.
- Prefer `ComboBox.Trigger` in new code. `ComboBox.Button` remains available as a compatibility alias.
- Use `ComboBox.Clear` when you want a built-in clear affordance that resets both the input and selected value.
- Provide a stable `id` in SSR environments to keep ARIA ids deterministic.
- Render `ComboBox.Tags`, `ComboBox.Tag`, and `ComboBox.TagRemove` in multiple mode to expose selected values.
- Choose `trigger="focus"`, `trigger="input"`, or `trigger="press"` based on your opening behavior requirements.

## Anatomy

Import the component and compose its parts:

```svelte
<ComboBox.Root>
	<ComboBox.Input />
	<ComboBox.Clear />
	<ComboBox.Trigger />
	<ComboBox.Popover>
		<ComboBox.List>
			<ComboBox.Item id="1">Option 1</ComboBox.Item>
		</ComboBox.List>
	</ComboBox.Popover>
</ComboBox.Root>
```

- `ComboBox.Root`
- `ComboBox.Input`
- `ComboBox.Trigger`
- `ComboBox.Button`
- `ComboBox.Clear`
- `ComboBox.Popover`
- `ComboBox.List`
- `ComboBox.Item`
- `ComboBox.ItemIndicator`
- `ComboBox.Tags`
- `ComboBox.Tag`
- `ComboBox.TagRemove`
