# Switch

## Description

`Switch` is a composable boolean switch with controlled and uncontrolled checked state, hidden input form support, and a headless thumb part for custom styling.

## Anatomy

- `Switch.Root`
- `Switch.Thumb`

```svelte
<Switch.Root aria-label="Enable notifications">
	<Switch.Thumb />
</Switch.Root>
```

## Usage guidelines

- Use `isChecked` / `defaultChecked` for the switch state.
- Use `onCheckedChange` to react to user-driven state changes.
- Use `value` only for form submission through the hidden native input; it does not represent the visual state.
- Wrap the switch in a native `<label>` for the simplest accessible labeling pattern.

## API reference

- `Switch.Root`
  - `isChecked?: boolean`
  - `defaultChecked?: boolean`
  - `onCheckedChange?: (checked: boolean) => void`
  - `isDisabled?: boolean`
  - `isReadOnly?: boolean`
  - `name?: string`
  - `value?: string`
  - `form?: string`
  - `required?: boolean`
- `Switch.Thumb`

## Accessibility

- `Switch.Root` exposes `role="switch"` with `aria-checked="true" | "false"`.
- Press `Space` to toggle the switch.
- `isReadOnly` keeps the switch focusable while preventing state changes.

## Notes

- A hidden checkbox input is kept in sync for form integration and `label[for]` support.
