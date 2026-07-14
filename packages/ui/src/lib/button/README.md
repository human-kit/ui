# Button

## Description

`Button` is a headless native button with RAC-aligned pending semantics, pressed-state exposure, and modality-aware focus data attributes.

## Anatomy

- `Button.Root`

```svelte
<Button.Root>
	{#snippet children({ pending, pressed })}
		{#if pending}
			<SavingSpinner />
		{:else}
			<span class:is-pressed={pressed}>Save</span>
		{/if}
	{/snippet}
</Button.Root>
```

## Usage guidelines

- Use native button props such as `type`, `name`, `value`, and form attributes directly on `Button.Root`.
- Use `pending` to keep the button focusable while blocking activation and hover state.
- Style interaction states with `data-hovered`, `data-pressed`, `data-focused`, `data-focus-visible`, `data-disabled`, and `data-pending`.

## API reference

`Button.Root` supports:

- `pending?: boolean`
- `disabled?: boolean`
- `children?: Snippet<[ButtonRenderState]> | Snippet`
- `type?: 'button' | 'submit' | 'reset'`
- `...restProps: HTMLButtonAttributes`

## Accessibility

- `Button.Root` renders a native `<button>`.
- `pending` applies `aria-disabled="true"`, preserves focusability, blocks press behavior, and announces the pending state through an internal polite live region.
- `data-focus-visible` follows the shared modality contract and is only exposed for keyboard or virtual focus.

## Notes

- When `type="submit"` and `pending` is true, the rendered button type switches to `button` to prevent implicit and explicit form submission.
- Pending does not serialize `data-disabled`; it is represented by `data-pending`.
