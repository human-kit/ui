# TextArea

## Description

`TextArea` is a headless native multiline text input with modality-aware focus state, RAC-style disabled and read-only booleans, validation data attributes, and optional auto-resize behavior.

## Anatomy

- `TextArea`

```svelte
<TextArea aria-label="Message" placeholder="Write your message..." isRequired autoResize />
```

## Usage guidelines

- Use native textarea props like `name`, `value`, `placeholder`, `rows`, `cols`, `maxlength`, and `wrap` directly on `TextArea`.
- Prefer `isDisabled`, `isReadOnly`, `isInvalid`, and `isRequired` when you want RAC-style naming while keeping native behavior.
- Enable `autoResize` when the textarea should grow with content. Use `minRows` and `maxRows` to bound the height.
- Style state with `data-focused`, `data-focus-visible`, `data-hovered`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, and `data-autoresize`.

## API reference

`TextArea` supports:

- `isDisabled?: boolean`
- `isReadOnly?: boolean`
- `isInvalid?: boolean`
- `isRequired?: boolean`
- `autoResize?: boolean`
- `minRows?: number`
- `maxRows?: number`
- `value?: string`
- `element?: HTMLTextAreaElement | null`
- `...restProps: HTMLTextareaAttributes`

## Accessibility

- `TextArea` renders a native `<textarea>`.
- `TextArea` supports `bind:value`.
- `data-focus-visible` follows the shared modality contract and only appears for keyboard or virtual focus.
- `isInvalid` maps to `aria-invalid`, `isReadOnly` maps to `readonly` and `aria-readonly`, and `isRequired` maps to `required` and `aria-required`.
- Native textarea semantics already expose multiline textbox behavior, so no manual `aria-multiline` is needed.
