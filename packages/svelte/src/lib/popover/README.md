# Popover

## Description
`Popover` renders floating content anchored to a trigger element. It supports modal and non-modal interaction patterns, outside interaction handling, and configurable positioning.

## Usage guidelines
- Use `Popover.Root` to share open state and trigger reference.
- Use `Popover.Trigger` when you want to auto-wire an existing button in children.
- Use `Popover.TriggerButton` when you want a pre-wired trigger button component.
- Use `Popover.Content` inside `Popover.Root`, or in standalone mode with `open`, `triggerRef`, and `onOpenChange`.
- Configure `isNonModal`, `shouldCloseOnInteractOutside`, and `shouldCloseOnBlur` to match your interaction model.

## Anatomy
Import the component and compose its parts:

```svelte
<Popover.Root>
	<Popover.Trigger>
		<button>Open</button>
	</Popover.Trigger>
	<Popover.Content>
		<div>Content</div>
	</Popover.Content>
</Popover.Root>
```

- `Popover.Root`
- `Popover.Trigger` or `Popover.TriggerButton`
- `Popover.Content`
