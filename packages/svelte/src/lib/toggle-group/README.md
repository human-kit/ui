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
- `isDisabled?: boolean`
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
- Form serialization is out of scope for this primitive.
