---
title: Switch
description: A composable boolean switch with controlled and uncontrolled state, hidden input form support, and a headless thumb part for custom styling.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import States from './demos/states.svelte';
	import statesSource from './demos/states.svelte?highlight';
	import Form from './demos/form.svelte';
	import formSource from './demos/form.svelte?highlight';
	import api from './api.json';
</script>

# Switch

A composable boolean switch with controlled and uncontrolled checked state, hidden input form support, and a headless thumb part for custom styling.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

The switch is assembled from two parts. `Switch.Root` renders the track (and a hidden checkbox input for form integration); `Switch.Thumb` renders the moving indicator.

```svelte
<script>
	import { Switch } from '@human-kit/ui';
</script>

<Switch.Root aria-label="Enable notifications">
	<Switch.Thumb />
</Switch.Root>
```

## States

Every visual state is exposed through `data-*` attributes on both parts, so all styling — including `disabled` and `readonly` — is done with plain CSS or utility classes.

<Demo source={statesSource}><States /></Demo>

## Forms

`Switch.Root` keeps a hidden checkbox in sync: give it a `name` and `value` and the pair is submitted when the switch is on. `value` only affects form submission, never the visual state.

<Demo source={formSource}><Form /></Demo>

## Usage guidelines

- Use `checked` / `defaultChecked` for the switch state.
- Use `onCheckedChange` to react to user-driven state changes.
- Use `value` only for form submission through the hidden native input; it does not represent the visual state.
- Wrap the switch in a native `<label>` for the simplest accessible labeling pattern, or point a sibling `label[for]` at the switch `id`.

## Accessibility

- `Switch.Root` exposes `role="switch"` with `aria-checked="true" | "false"`.
- Press `Space` to toggle the switch.
- `readonly` keeps the switch focusable while preventing state changes.

## API reference

<ApiReference api={api} />
