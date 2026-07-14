# Toggle

## Description

`Toggle` is a headless two-state button with controlled and uncontrolled selected state, native button semantics, and modality-aware styling hooks.

## Anatomy

- `Toggle.Root`

```svelte
<Toggle.Root defaultSelected aria-label="Favorite">Favorite</Toggle.Root>
```

## Usage guidelines

- Use `selected` / `defaultSelected` for the toggle state.
- In controlled or bound usage, `selected={undefined}` syncs as `false`; omit `selected` to use `defaultSelected`.
- Use `onChange` to react to user-driven state changes.
- Use `value` as a stable identifier for composition with future toggle-group behavior.
- Icon-only toggles must provide an accessible name through `aria-label` or `aria-labelledby`.
- If the visible label changes with state, keep the accessible name stable and let `aria-pressed` announce the state.

## API reference

`Toggle.Root` supports:

- `value?: string`
- `selected?: boolean`
- `defaultSelected?: boolean`
- `onChange?: (selected: boolean) => void`
- `disabled?: boolean`
- `children?: Snippet<[ToggleRenderState]> | Snippet`
- `...restProps: HTMLButtonAttributes`

## Accessibility

- `Toggle.Root` renders a native `<button type="button">`.
- The selected state is exposed to assistive technology with `aria-pressed="true" | "false"`.
- Native keyboard activation is supported with `Enter` and `Space`.
- `data-focus-visible` follows the shared modality contract and is only exposed for keyboard or virtual focus.

## Notes

- `value` is forwarded to the button and does not represent the selected state.
- Form serialization and `ToggleGroup` behavior are out of scope for this standalone primitive.
