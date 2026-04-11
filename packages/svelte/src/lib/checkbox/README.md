# Checkbox

## Description

`Checkbox` is a composable tri-state checkbox with separate checked and indeterminate bindings, hidden input form support, and headless indicator rendering.

## Anatomy

- `Checkbox.Root`
- `Checkbox.Indicator`

```svelte
<Checkbox.Root aria-label="Accept terms">
	<Checkbox.Indicator>
		<CheckIcon />
	</Checkbox.Indicator>
</Checkbox.Root>
```

## Usage guidelines

- Use `isChecked` / `defaultChecked` for the checked state and `isIndeterminate` / `defaultIndeterminate` for the mixed state.
- `isIndeterminate` takes precedence over `isChecked`. When both are `true`, the checkbox is exposed as indeterminate.
- Use `value` only for form submission through the hidden native input; it does not represent the visual state.
- Wrap the checkbox in a native `<label>` for the simplest accessible labeling pattern.

## API reference

- `Checkbox.Root`
  - `isChecked?: boolean`
  - `defaultChecked?: boolean`
  - `isIndeterminate?: boolean`
  - `defaultIndeterminate?: boolean`
  - `onCheckedChange?: (checked: boolean) => void`
  - `onIndeterminateChange?: (indeterminate: boolean) => void`
  - `isDisabled?: boolean`
  - `isReadOnly?: boolean`
  - `name?: string`
  - `value?: string`
  - `required?: boolean`
- `Checkbox.Indicator`
  - `keepMounted?: boolean`

## Accessibility

- `Checkbox.Root` exposes `role="checkbox"` with `aria-checked="true" | "false" | "mixed"`.
- Press `Space` to toggle the checkbox.
- `isReadOnly` keeps the checkbox focusable while preventing state changes.

## Notes

- The first user toggle from the indeterminate state resolves to checked.
- A hidden checkbox input is kept in sync for form integration and `label[for]` support.
