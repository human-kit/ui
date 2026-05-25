# Tabs

## Description

`Tabs` is a headless tab primitive with roving focus, automatic or manual keyboard activation, disabled tabs, and panel composition.

## Anatomy

```svelte
<Tabs.Root defaultValue="overview">
	<Tabs.List aria-label="Account sections">
		<Tabs.Tab value="overview">Overview</Tabs.Tab>
		<Tabs.Tab value="billing">Billing</Tabs.Tab>
		<Tabs.Indicator />
	</Tabs.List>

	<Tabs.Panel value="overview">Overview content</Tabs.Panel>
	<Tabs.Panel value="billing">Billing content</Tabs.Panel>
</Tabs.Root>
```

- `Tabs.Root`
- `Tabs.List`
- `Tabs.Tab`
- `Tabs.Indicator`
- `Tabs.Panel`

## Usage Guidelines

- Provide a unique `value` for every `Tabs.Tab` and matching `Tabs.Panel`.
- Use `value` / `onChange` for controlled state and `defaultValue` for uncontrolled state.
- Set `defaultValue={null}` when no tab should be active initially.
- Use `keyboardActivation="manual"` when panel activation is expensive or should wait for Enter/Space.
- Use `orientation="vertical"` for vertical tab lists.
- Use `forceMount` on `Tabs.Panel` when inactive panel state must be preserved in the DOM.

## Accessibility

- `Tabs.List` renders `role="tablist"` and mirrors the configured orientation.
- `Tabs.Tab` renders button semantics with `role="tab"`, `aria-selected`, and `aria-controls`.
- `Tabs.Panel` renders `role="tabpanel"` and `aria-labelledby`.
- Arrow keys move focus within the tab list, Home/End jump to the first or last enabled tab, and focus wraps at the ends.
