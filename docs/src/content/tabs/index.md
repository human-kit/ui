---
title: Tabs
description: A headless tab primitive with roving focus, automatic or manual keyboard activation, disabled tabs, and panel composition.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Manual from './demos/manual.svelte';
	import manualSource from './demos/manual.svelte?highlight';
	import Vertical from './demos/vertical.svelte';
	import verticalSource from './demos/vertical.svelte?highlight';
	import api from './api.json';
</script>

# Tabs

A headless tab primitive with roving focus, automatic or manual keyboard activation, disabled tabs, and panel composition.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

Give every `Tabs.Tab` a unique `value` and pair it with a `Tabs.Panel` carrying the same value. The optional `Tabs.Indicator` tracks the active tab through CSS variables (`--active-tab-left`, `--active-tab-top`, `--active-tab-width`, `--active-tab-height`) so it can animate between tabs.

```svelte
<script>
	import { Tabs } from '@human-kit/svelte-components';
</script>

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

## Manual activation

By default arrow keys activate tabs as focus moves. With `keyboardActivation="manual"`, arrow keys only move focus and the focused tab activates on Enter or Space — useful when switching panels is expensive.

<Demo source={manualSource}><Manual /></Demo>

## Vertical orientation and disabled tabs

Set `orientation="vertical"` to stack the tab list and switch arrow-key navigation to Up/Down. Pass `disabledKeys` on `Tabs.Root` (or `disabled` on a single `Tabs.Tab`) to keep specific tabs from being activated.

<Demo source={verticalSource}><Vertical /></Demo>

## Usage guidelines

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

## API reference

<ApiReference api={api} />
