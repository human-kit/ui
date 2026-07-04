---
title: Accordion
description: A headless disclosure primitive with roving focus, single or multiple expansion, disabled items, and controlled or uncontrolled open state.
---

<script>
	import { Demo, ApiReference } from '@human-kit/humandocs/components';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Multiple from './demos/multiple.svelte';
	import multipleSource from './demos/multiple.svelte?highlight';
	import api from './api.json';
</script>

# Accordion

A headless disclosure primitive: a vertical (or horizontal) stack of collapsible sections with roving focus, single or multiple expansion, disabled items, and controlled/uncontrolled open state.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

Provide a unique `value` on every `Accordion.Item` — the matching `Header`, `Trigger` and `Panel` read it from the item context, so you only declare it once.

```svelte
<script>
	import { Accordion } from '@human-kit/ui';
</script>

<Accordion.Root defaultValue={['overview']}>
	<Accordion.Item value="overview">
		<Accordion.Header>
			<Accordion.Trigger>Overview</Accordion.Trigger>
		</Accordion.Header>
		<Accordion.Panel>Overview content</Accordion.Panel>
	</Accordion.Item>
</Accordion.Root>
```

## Multiple expansion and disabled items

Set `selectionMode="multiple"` to allow more than one panel open at a time (default is `"single"`). Use `disabled` on `Accordion.Item` to disable a single item, or on `Accordion.Root` to disable the whole accordion.

<Demo source={multipleSource}><Multiple /></Demo>

## Usage guidelines

- Use `value` / `onChange` for controlled state and `defaultValue` for uncontrolled state. Both are arrays of open item values.
- Use `disallowEmptySelection` to keep at least one panel open.
- Use `orientation="horizontal"` to switch the arrow-key navigation axis.
- Use `loop={false}` to stop focus from wrapping at the first and last triggers.
- Use `forceMount` on `Accordion.Panel` when collapsed panel content must stay in the DOM.
- Set `level` on `Accordion.Header` (1–6, default `3`) to match the surrounding document outline.

## Accessibility

- `Accordion.Header` renders a real heading element (`<h3>` by default) that wraps the trigger button, following the WAI-ARIA accordion pattern.
- `Accordion.Trigger` renders button semantics with `aria-expanded` and `aria-controls`.
- `Accordion.Panel` renders `role="region"` and `aria-labelledby` pointing at its trigger, and is `hidden` + `inert` while collapsed.
- Arrow keys move focus between triggers, Home/End jump to the first or last enabled trigger, and focus wraps at the ends unless `loop={false}`.
- Enter/Space toggle the focused panel via native button activation.

## API reference

<ApiReference api={api} />
