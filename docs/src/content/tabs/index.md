---
title: Tabs
description: A headless tab primitive with roving focus, automatic or manual keyboard activation, disabled tabs, and panel composition.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Vertical from './demos/vertical.svelte';
	import verticalSource from './demos/vertical.svelte?highlight';
	import api from './api.json';
</script>

# Tabs

This is a headless tab component with roving focus and disabled tabs. The keyboard can activate a tab automatically or manually. You assemble the panels yourself.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

Give each `Tabs.Tab` a unique `value`, and give the same value to its `Tabs.Panel`. `Tabs.Indicator` is optional. It follows the active tab through four CSS variables (`--active-tab-left`, `--active-tab-top`, `--active-tab-width`, and `--active-tab-height`). Thus it can move from one tab to the next tab with an animation.

```svelte
<script>
	import { Tabs } from '@human-kit/ui';
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

By default, the arrow keys activate each tab as the focus moves. With `keyboardActivation="manual"`, the arrow keys move only the focus. Then the `Enter` key or the `Space` key activates the tab with the focus. Use this mode when a panel is expensive.

## Vertical orientation and disabled tabs

Set `orientation="vertical"` to put the tab list in a column and to move the keyboard operation to the Up arrow key and the Down arrow key. Use `disabledKeys` on `Tabs.Root`, or `disabled` on one `Tabs.Tab`, to stop the activation of specified tabs.

<Demo source={verticalSource}><Vertical /></Demo>

## Usage guidelines

- Give a unique `value` to each `Tabs.Tab` and to its `Tabs.Panel`.
- Use `value` and `onChange` when your own code controls the state. Use `defaultValue` when the component controls the state.
- Set `defaultValue={null}` when no tab must be active at the start.
- Use `keyboardActivation="manual"` when a panel is expensive, or when the activation must wait for the `Enter` key or the `Space` key.
- Use `orientation="vertical"` for a tab list in a column.
- Use `forceMount` on `Tabs.Panel` when the state of an inactive panel must stay in the DOM.

## Accessibility

- `Tabs.List` has `role="tablist"`, and it shows the orientation that you set.
- `Tabs.Tab` has button semantics with `role="tab"`, `aria-selected`, and `aria-controls`.
- `Tabs.Panel` has `role="tabpanel"` and `aria-labelledby`.
- The arrow keys move the focus in the tab list. The `Home` key and the `End` key move the focus to the first enabled tab and to the last enabled tab. At the ends, the focus goes to the opposite end.

## API reference

<ApiReference api={api} />
