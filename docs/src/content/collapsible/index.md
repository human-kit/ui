---
title: Collapsible
description: A headless single disclosure primitive with controlled or uncontrolled open state and a disabled state.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# Collapsible

This is a headless disclosure component: a button that shows and hides one panel. You can control the open state, or you can let the component control it. The component also has a disabled state.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

The collapsible has three parts. `Collapsible.Root` gives the shared context. `Collapsible.Trigger` makes the button. `Collapsible.Panel` contains the content that the trigger shows and hides.

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

Bind `open`, or use `open` with `onOpenChange`, to control the panel from your own code — for example from a button in a different part of the page. Use `defaultOpen` when the component controls its own state.

## Usage guidelines

- Use `open` and `onOpenChange` when your own code controls the state. Use `defaultOpen` when the component controls the state.
- Use `disabled` to stop the trigger.
- Use `forceMount` on `Collapsible.Panel` when the content must stay in the DOM while the panel is closed.
- For a set of sections where only one section opens at a time, use `Accordion`.

## Accessibility

- `Collapsible.Trigger` has button semantics with `aria-expanded`. Its `aria-controls` attribute points at the panel. This obeys the WAI-ARIA disclosure pattern.
- While the panel is closed, `Collapsible.Panel` is `hidden` and `inert`. The panel has the `id` that the trigger points at.
- The `Enter` key and the `Space` key open and close the panel, like a native button.

## API reference

<ApiReference api={api} />
