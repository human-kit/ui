# Popover

## Description

`Popover` renders floating content anchored to a trigger element. It supports modal and non-modal interaction patterns, outside interaction handling, and configurable positioning.

## Usage guidelines

- Use `Popover.Root` to share open state and trigger reference.
- Use `Popover.Trigger` as the opener button.
- Use `Popover.Content` inside `Popover.Root`, or in standalone mode with `open`, `triggerRef`, and `onOpenChange`.
- Configure `nonModal`, `shouldCloseOnInteractOutside`, and `shouldCloseOnBlur` to match your interaction model.

## onOpenChange details

`Popover.Root` and standalone `Popover.Content` use:

- `onOpenChange(open, details)`
- `details.reason`: `trigger-press | imperative-action | none | escape-key | outside-press | focus-out | close-press`
- `details.event?`: native event that triggered the change when available
- `details.cancel()`: prevents the open-state transition
- `details.isCanceled`: reflects cancellation state inside the callback

## Anatomy

Import the component and compose its parts:

```svelte
<Popover.Root>
	<Popover.Trigger>Open</Popover.Trigger>
	<Popover.Content>
		<div>Content</div>
	</Popover.Content>
</Popover.Root>
```

- `Popover.Root`
- `Popover.Trigger`
- `Popover.Content`
