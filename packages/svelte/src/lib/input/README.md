# Input

## Description

`Input` is a headless native text input with modality-aware focus state, RAC-style disabled and read-only booleans, and data attributes for validation and form styling.

## Anatomy

- `Input`

```svelte
<Input aria-label="Email" placeholder="name@example.com" isInvalid={hasError} isRequired />
```

## Usage guidelines

- Use native input props like `type`, `name`, `value`, `defaultValue`, `placeholder`, and `autocomplete` directly on `Input`.
- Prefer `isDisabled`, `isReadOnly`, `isInvalid`, and `isRequired` when you want RAC-style naming while keeping native behavior.
- Style state with `data-focused`, `data-focus-visible`, `data-hovered`, `data-disabled`, `data-readonly`, `data-invalid`, and `data-required`.

## API reference

`Input` supports:

- `isDisabled?: boolean`
- `isReadOnly?: boolean`
- `isInvalid?: boolean`
- `isRequired?: boolean`
- `element?: HTMLInputElement | null`
- `...restProps: HTMLInputAttributes`

## Accessibility

- `Input` renders a native `<input>` with `type="text"` by default.
- `data-focus-visible` follows the shared modality contract and only appears for keyboard or virtual focus.
- `isInvalid` maps to `aria-invalid`, `isReadOnly` maps to `readonly` and `aria-readonly`, and `isRequired` maps to `required` and `aria-required`.
