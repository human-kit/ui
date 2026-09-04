# Collapsible

## Description

`Collapsible` is a headless disclosure component: a button that shows and hides one panel. You can control the open state, or the component can control it. It also has a disabled state.

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
- Use `disabled` to stop the trigger. It cannot open or close the panel.
- Use `forceMount` on `Collapsible.Panel` when collapsed content must stay in the DOM.
- For grouped disclosures where only one section opens at a time, use `Accordion` instead.

## Accessibility

- `Collapsible.Trigger` renders button semantics with `aria-expanded` and `aria-controls` pointing at the panel, following the WAI-ARIA disclosure pattern.
- `Collapsible.Panel` is `hidden` + `inert` while collapsed and carries the `id` referenced by the trigger.
- The `Enter` key and the `Space` key open and close the panel, like a native button.
