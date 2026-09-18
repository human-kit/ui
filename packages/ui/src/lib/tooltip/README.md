# Tooltip

## Description

`Tooltip` shows a short description of a control when the pointer rests on it, or when the keyboard puts the focus on it. It holds text only. A screen reader reads the text after the name of the control.

## Anatomy

- `Tooltip.Provider`
- `Tooltip.Root`
- `Tooltip.Trigger`
- `Tooltip.Content`
- `Tooltip.Arrow`

```svelte
<Tooltip.Root>
	<Tooltip.Trigger aria-label="Bold">B</Tooltip.Trigger>
	<Tooltip.Content>
		Bold
		<Tooltip.Arrow />
	</Tooltip.Content>
</Tooltip.Root>
```

## Usage guidelines

- Use it for a description the user can do without. A touch has no hover.
- Give the trigger a name of its own. The tooltip is the description, not the name.
- Put only text in the content. It takes no focus.
- Put a `Tooltip.Provider` around a toolbar, thus every tooltip in it has the same delays.
- Give an element that is not a `Tooltip.Trigger` to `triggerRef` on the root.

## API reference

- `Tooltip.Root`
  - `open?: boolean`, `defaultOpen?: boolean`, `controlledOpen?: boolean`
  - `onOpenChange?: (open, details) => void`
  - `delay?: number` (600), `closeDelay?: number` (100)
  - `disabled?: boolean`
  - `openOnLongPress?: boolean`
  - `triggerRef?: HTMLElement | null`
- `Tooltip.Provider`
  - `delay?: number`, `closeDelay?: number`, `skipDelay?: number` (300)
- `Tooltip.Content`
  - `placement?: ExtendedPlacement` (top), `offset?: number` (8), `shouldFlip?: boolean`, `boundaryElement?: Element | null`
  - `followPointer?: 'x' | 'y' | 'both'`

## Accessibility

- `Tooltip.Content` has `role="tooltip"`; the trigger gets `aria-describedby` while the content is in the DOM.
- A keyboard focus opens at once. A focus that a script gives opens only with the keyboard modality. A touch does not open.
- The pointer can cross the gap to the content in a straight line, and rest on the content. `Escape` closes, and a press on the trigger closes.
- One tooltip at most is open on the page. The next one after a close skips its delay for `skipDelay` milliseconds.
