# Accordion

## Description

`Accordion` is a headless disclosure primitive: a vertical (or horizontal) stack of collapsible sections with roving focus, single or multiple expansion, disabled items, and controlled/uncontrolled open state.

## Anatomy

```svelte
<Accordion.Root defaultValue={['overview']}>
	<Accordion.Item value="overview">
		<Accordion.Header>
			<Accordion.Trigger>Overview</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel>Overview content</Accordion.Panel>
	</Accordion.Item>

	<Accordion.Item value="billing">
		<Accordion.Header>
			<Accordion.Trigger>Billing</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel>Billing content</Accordion.Panel>
	</Accordion.Item>
</Accordion.Root>
```

- `Accordion.Root`
- `Accordion.Item`
- `Accordion.Header`
- `Accordion.Trigger`
- `Accordion.Panel`

## Usage Guidelines

- Provide a unique `value` on every `Accordion.Item`. The matching `Header`, `Trigger` and `Panel` read it from the item context, so you only declare it once.
- Use `value` / `onChange` for controlled state and `defaultValue` for uncontrolled state. Both are arrays of open item values.
- Set `selectionMode="multiple"` to allow more than one panel open at a time (default is `"single"`).
- Use `disallowEmptySelection` to keep at least one panel open.
- Use `disabled` on `Accordion.Item` to disable a single item, or `disabled` on `Accordion.Root` to disable the whole accordion.
- Use `orientation="horizontal"` to switch the arrow-key navigation axis.
- Use `loop={false}` to stop focus from wrapping at the first and last triggers.
- Use `forceMount` on `Accordion.Panel` when collapsed panel content must stay in the DOM.
- Set `level` on `Accordion.Header` (1–6, default `3`) to match the surrounding document outline.

## Accessibility

- `Accordion.Header` renders a real heading element (`<h3>` by default) that wraps the trigger button, following the WAI-ARIA accordion pattern.
- `Accordion.Trigger` renders button semantics with `aria-expanded` and `aria-controls`.
- `Accordion.Panel` renders `role="region"` and `aria-labelledby` pointing at its trigger, and is `hidden` + `inert` while collapsed. Set `region={false}` on panels of large accordions (the APG recommends avoiding `region` landmarks beyond roughly six panels) so assistive-technology landmark lists are not flooded.
- Arrow keys move focus between triggers, Home/End jump to the first or last enabled trigger, and focus wraps at the ends unless `loop={false}`.
- Enter/Space toggle the focused panel via native button activation.
