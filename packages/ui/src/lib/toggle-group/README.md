# ToggleGroup

## Description

`ToggleGroup` coordinates multiple `Toggle.Root` buttons with single or multiple selection, roving focus, disabled handling, and array-based controlled or uncontrolled value.

## Anatomy

- `ToggleGroup.Root`
- `Toggle.Root`

```svelte
<ToggleGroup.Root defaultValue={['bold']} selectionMode="multiple" aria-label="Text style">
	<Toggle.Root value="bold">Bold</Toggle.Root>
	<Toggle.Root value="italic">Italic</Toggle.Root>
</ToggleGroup.Root>
```

## Usage guidelines

- Use `value` / `defaultValue` arrays for both single and multiple selection.
- Use `bind:value` to hand the group your state, or plain `value` + `onChange` to own it
  yourself. There is no flag to declare which: supplying `value` makes it the source of
  truth either way, and `onChange` always reports.
- A parent that holds `value` and refuses a change — it sends no new value down — still sees the group move. The group then goes back to the value of the parent at the next render. Refuse a change with a render, and not with silence.
- Use `selectionMode="single"` when only one toggle can be selected.
- Use `selectionMode="multiple"` when several toggles can be selected.
- Use `disallowEmptySelection` when at least one enabled toggle must remain selected.
- Every grouped `Toggle.Root` must provide a unique `value`.

## API reference

`ToggleGroup.Root` supports:

- `value?: ToggleGroupValue[]`
- `defaultValue?: ToggleGroupValue[]`
- `onChange?: (value: ToggleGroupValue[]) => void`
- `selectionMode?: 'single' | 'multiple'`
- `disabled?: boolean`
- `orientation?: 'horizontal' | 'vertical'`
- `disallowEmptySelection?: boolean`
- `children?: Snippet`
- `...restProps: HTMLAttributes<HTMLDivElement>`

## Accessibility

- `ToggleGroup.Root` renders `role="group"`.
- Provide an accessible group name with `aria-label` or `aria-labelledby`.
- Each `Toggle.Root` remains a native toggle button with `aria-pressed`.
- Arrow keys move focus through enabled toggles; `Home` and `End` jump to the bounds.

## Notes

- Grouped toggles ignore their standalone `selected` and `defaultSelected` props.
- Removing one `Toggle.Root` from a mounted group is a real selection change: with
  `disallowEmptySelection` the group picks a fallback and fires `onChange`. The removal of the full group is not a change, and it reports nothing. Without this rule, a move to a different screen would look like a press on the last toggle.
- Form serialization is out of scope for this primitive.
