# Collapsible

## Description

`Collapsible` is a headless single disclosure primitive: a button that shows and hides an associated panel, with controlled or uncontrolled open state and a disabled state.

## Anatomy

```svelte
<Collapsible.Root defaultOpen>
	<Collapsible.Trigger>Details</Collapsible.Trigger>
	<Collapsible.Panel>Hidden content revealed on toggle.</Collapsible.Panel>
</Collapsible.Root>
```

- `Collapsible.Root`
- `Collapsible.Trigger`
- `Collapsible.Panel`

## Usage Guidelines

- Use `open` / `onOpenChange` for controlled state and `defaultOpen` for uncontrolled state.
- Use `isDisabled` to prevent the trigger from toggling the panel.
- Use `forceMount` on `Collapsible.Panel` when collapsed content must stay in the DOM.
- For grouped disclosures where only one section opens at a time, use `Accordion` instead.

## Accessibility

- `Collapsible.Trigger` renders button semantics with `aria-expanded` and `aria-controls` pointing at the panel, following the WAI-ARIA disclosure pattern.
- `Collapsible.Panel` is `hidden` + `inert` while collapsed and carries the `id` referenced by the trigger.
- Enter/Space toggle the panel via native button activation.
