# PinInput

## Description

`PinInput` is a form field for a short code: a PIN, or the verification code of a message. Each character has its own cell, and each cell is a real input. The telephone shows the correct keyboard, and a code from a message fills each cell with one touch.

## Anatomy

- `PinInput.Root`
- `PinInput.Label`
- `PinInput.Cell`

```svelte
<PinInput.Root name="code" length={6} otp>
	<PinInput.Label>Verification code</PinInput.Label>
	{#each { length: 6 } as _, index (index)}
		<PinInput.Cell />
	{/each}
</PinInput.Root>
```

## Usage guidelines

- Use `bind:value` for the state, or `value` with `onChange` and `controlledValue` to hold it yourself.
- Give one `PinInput.Cell` for each character of `length`.
- Use `onComplete` for the work that follows the last character, for example the send of the form.
- Use `otp` for a code that arrives in a message, and `mask` for a PIN the shoulder of a stranger must not read.
- `type` decides which characters each cell accepts: `numeric`, `alphanumeric` or `alphabetic`. Give `pattern` for a test of your own.
- The value has no holes. The characters fill the cells from the first one. A press on a cell past the first empty one goes to that one. A character that goes away takes the ones after it one cell to the left.

## API reference

- `PinInput.Root`
  - `value?: string`
  - `defaultValue?: string`
  - `controlledValue?: boolean`
  - `onChange?: (value, details) => void`
  - `onComplete?: (value) => void`
  - `length?: number`
  - `type?: 'numeric' | 'alphanumeric' | 'alphabetic'`, `pattern?: RegExp`
  - `otp?: boolean`, `mask?: boolean`, `placeholder?: string`
  - `blurOnComplete?: boolean`
  - `disabled?: boolean`, `readonly?: boolean`, `required?: boolean`, `invalid?: boolean`
  - `name?: string`, `form?: string`
- `PinInput.Cell`
  - `index?: number`
  - `aria-label?: string`

## Accessibility

- The root is a `role="group"` named by `PinInput.Label`, `aria-labelledby` or `aria-label`. With `otp` the group takes the name "Verification code" in the locale.
- Each cell is an `<input>` with its own name, for example "Digit 2 of 6", and with `inputmode`, `autocomplete` and `aria-invalid`.
- The keyboard: a character moves the focus to the next cell. `Backspace` clears the cell, or the one before it. `Delete` clears the cell, the arrows move between the cells, and `Home` and `End` go to the ends. The horizontal arrows follow the text direction.
- A paste goes across the cells from the cell it starts in, and the characters the type refuses are dropped.
- The whole value in a form comes from a hidden input. A `<form>` reset takes the first value back.
