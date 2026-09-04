---
title: Switch
description: A composable boolean switch with controlled and uncontrolled state, hidden input form support, and a headless thumb part for custom styling.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# Switch

This is a boolean switch. You can control the checked state, or you can let the component control it. A hidden input gives the form support, and the thumb part has no styles.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

The switch has two parts. `Switch.Root` makes the track and a hidden checkbox input for the form. `Switch.Thumb` makes the indicator that moves.

```svelte
<script>
	import { Switch } from '@human-kit/ui';
</script>

<Switch.Root aria-label="Enable notifications">
	<Switch.Thumb />
</Switch.Root>
```

## States

Both parts show each visual state in `data-*` attributes. Thus you write all of the styles in plain CSS or in utility classes. This includes the styles for the `disabled` state and the `readonly` state.

## Forms

`Switch.Root` keeps a hidden checkbox correct. Give the root a `name` and a `value`. If the switch is on, the form submits the pair. The `value` prop changes only the form submission. It does not change the visual state.

## Usage guidelines

- Use `checked` and `defaultChecked` for the state of the switch.
- Use `onCheckedChange` to react when the user changes the state.
- Use `value` only for the form submission through the hidden native input. The `value` prop does not show the visual state.
- Put the switch in a native `<label>` element. This is the most simple label pattern. As an alternative, point a `label[for]` element at the `id` of the switch.

## Accessibility

- `Switch.Root` has `role="switch"` with `aria-checked="true" | "false"`.
- Push the `Space` key to change the switch.
- The `readonly` prop keeps the switch focusable, but it stops the state changes.

## API reference

<ApiReference api={api} />
