# NumberField

Composable numeric input with formatted text entry, spinbutton semantics, stepper buttons, optional wheel scrubbing, and pointer scrubbing.

## Anatomy

```svelte
<NumberField.Root>
	<NumberField.ScrubArea>
		<NumberField.ScrubAreaCursor />
	</NumberField.ScrubArea>
	<NumberField.Group>
		<NumberField.Decrement />
		<NumberField.Input />
		<NumberField.Increment />
	</NumberField.Group>
</NumberField.Root>
```

## Usage Guidelines

- Provide an accessible name for `NumberField.Input` with `aria-label`, `aria-labelledby`, or a visible `<label for>`.
- Use `bind:value` for two-way state. The value is always `number | null`; the visible input text is formatted separately.
- Wrap the component in `LocaleProvider` to control locale-aware parsing and formatting.
- With `allowOutOfRange={false}`, out-of-range drafts remain editable while focused and clamp to `min` or `max` on commit.
- Percent formatting treats `%` as a localized display suffix: typing `50` publishes `50`, not `0.5`.
- Use `name` on `Root` only when the component should submit a raw numeric value in an HTML form.
- `incrementAriaLabel` and `decrementAriaLabel` override the localized defaults when custom control names are needed.

## API Reference

`NumberField.Root` accepts `value`, `defaultValue`, `onChange`, `formatOptions`, `min`, `max`, `step`, `smallStep`, `largeStep`, `isDisabled`, `isReadOnly`, `isRequired`, `isInvalid`, `allowWheelScrub`, `allowOutOfRange`, `snapOnStep`, `name`, `incrementAriaLabel`, and `decrementAriaLabel`.

## Accessibility

`NumberField.Input` renders a text input with `role="spinbutton"` and exposes `aria-valuemin`, `aria-valuemax`, `aria-valuenow`, and `aria-valuetext` when applicable. Keyboard users can increment and decrement with arrow keys, page keys, and Home/End. Pointer scrub has equivalent input, keyboard, and button controls.

Invalid drafts and out-of-range values set native custom validity on the visible input so form submission is blocked while the field is invalid. When `name` is provided, the hidden input submits the raw numeric value.
