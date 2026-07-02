# Input

## Description

`Input` is a headless native text input with modality-aware focus state, native disabled and read-only booleans, and data attributes for validation and form styling.

## Anatomy

- `Input`

```svelte
<Input aria-label="Email" placeholder="name@example.com" invalid={hasError} required />
```

## Usage guidelines

- Use native input props like `type`, `name`, `value`, `defaultValue`, `placeholder`, and `autocomplete` directly on `Input`.
- Use `disabled`, `readonly`, `invalid`, and `required` to control validation and interaction state while keeping native behavior.
- Style state with `data-focused`, `data-focus-visible`, `data-hovered`, `data-disabled`, `data-readonly`, `data-invalid`, and `data-required`.

## API reference

`Input` supports:

- `disabled?: boolean`
- `readonly?: boolean`
- `invalid?: boolean`
- `required?: boolean`
- `value?: string`
- `element?: HTMLInputElement | null`
- `...restProps: HTMLInputAttributes`

## Accessibility

- `Input` renders a native `<input>` with `type="text"` by default.
- `Input` supports `bind:value` for text-like inputs.
- `data-focus-visible` follows the shared modality contract and only appears for keyboard or virtual focus.
- `invalid` maps to `aria-invalid`, `readonly` maps to `readonly` and `aria-readonly`, and `required` maps to `required` and `aria-required`.
