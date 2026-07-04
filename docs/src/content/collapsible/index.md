---
title: Collapsible
description: A headless single disclosure primitive with controlled or uncontrolled open state and a disabled state.
---

<script>
	import Demo from '$lib/docs/demo.svelte';
	import ApiReference from '$lib/docs/api-reference.svelte';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Controlled from './demos/controlled.svelte';
	import controlledSource from './demos/controlled.svelte?highlight';
	import api from './api.json';
</script>

# Collapsible

A headless single disclosure primitive: a button that shows and hides an associated panel, with controlled or uncontrolled open state and a disabled state.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

The collapsible is assembled from three parts. `Collapsible.Root` provides the shared context, `Collapsible.Trigger` renders the toggle button, and `Collapsible.Panel` holds the content that is shown and hidden.

```svelte
<script>
	import { Collapsible } from '@human-kit/ui';
</script>

<Collapsible.Root defaultOpen>
	<Collapsible.Trigger>Details</Collapsible.Trigger>
	<Collapsible.Panel>Hidden content revealed on toggle.</Collapsible.Panel>
</Collapsible.Root>
```

## Controlled state

Bind `open` (or pair `open` with `onOpenChange`) to drive the panel from outside — for example from buttons elsewhere in the UI. Use `defaultOpen` instead when the collapsible should manage its own state.

<Demo source={controlledSource}><Controlled /></Demo>

## Usage guidelines

- Use `open` / `onOpenChange` for controlled state and `defaultOpen` for uncontrolled state.
- Use `disabled` to prevent the trigger from toggling the panel.
- Use `forceMount` on `Collapsible.Panel` when collapsed content must stay in the DOM.
- For grouped disclosures where only one section opens at a time, use `Accordion` instead.

## Accessibility

- `Collapsible.Trigger` renders button semantics with `aria-expanded` and `aria-controls` pointing at the panel, following the WAI-ARIA disclosure pattern.
- `Collapsible.Panel` is `hidden` + `inert` while collapsed and carries the `id` referenced by the trigger.
- Enter/Space toggle the panel via native button activation.

## API reference

<ApiReference {api} />
