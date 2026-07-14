# Dialog

## Description

`Dialog` provides an accessible modal pattern with trigger, portal, overlay, and content parts. It includes nested dialog stacking so only the topmost dialog handles global close interactions.

## Usage guidelines

- Place all dialog parts inside `Dialog.Root`.
- Use `Dialog.Trigger` as the opener button.
- Render modal layers inside `Dialog.Portal`.
- Use `Dialog.Overlay` and `Dialog.Content` together for standard modal behavior.
- Use nested `Dialog.Root` instances when you need modal stacks; topmost behavior is handled internally.

## Anatomy

Import the component and compose its parts:

```svelte
<Dialog.Root>
	<Dialog.Trigger>Open</Dialog.Trigger>
	<Dialog.Portal>
		<Dialog.Overlay />
		<Dialog.Content>...</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
```

- `Dialog.Root`
- `Dialog.Trigger`
- `Dialog.Portal`
- `Dialog.Overlay`
- `Dialog.Content`
