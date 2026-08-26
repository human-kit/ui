---
title: Checkbox
description: A composable tri-state checkbox with separate checked and indeterminate bindings, hidden input form support, and headless indicator rendering.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Indeterminate from './demos/indeterminate.svelte';
	import indeterminateSource from './demos/indeterminate.svelte?highlight';
	import api from './api.json';
</script>

# Checkbox

This is a checkbox with three states. The checked state and the indeterminate state have separate bindings. A hidden input gives the form support, and you write the indicator yourself.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

The checkbox has two parts. `Checkbox.Root` makes the control and a hidden checkbox input for the form. `Checkbox.Indicator` makes the check mark or the mixed mark. It is in the DOM only while the checkbox is checked or indeterminate.

```svelte
<script>
	import { Checkbox } from '@human-kit/ui';
</script>

<Checkbox.Root aria-label="Accept terms">
	<Checkbox.Indicator>
		<CheckIcon />
	</Checkbox.Indicator>
</Checkbox.Root>
```

## States

Both parts show each visual state in `data-*` attributes. Thus you write all of the styles in plain CSS or in utility classes. This includes the styles for the `disabled` state, the `readonly` state, and the `indeterminate` state.

## Indeterminate

The mixed state has its own `indeterminate` and `defaultIndeterminate` bindings. The mixed state has more importance than the `checked` state. From the indeterminate state, the first user action makes the checkbox checked.

<Demo source={indeterminateSource}><Indeterminate /></Demo>

## Forms

`Checkbox.Root` keeps a hidden checkbox input correct. Give the root a `name` and a `value`. If the checkbox is checked, the form submits the pair. If the checkbox is not checked, or if the checkbox is indeterminate, the form submits nothing.

## Usage guidelines

- Use `checked` and `defaultChecked` for the checked state. Use `indeterminate` and `defaultIndeterminate` for the mixed state.
- The `indeterminate` prop has more importance than the `checked` prop. If both props are `true`, the checkbox is indeterminate.
- Use `value` only for the form submission through the hidden native input. The `value` prop does not show the visual state.
- Put the checkbox in a native `<label>` element. This is the most simple label pattern. As an alternative, point a `label[for]` element at the `id` of the checkbox.

## Accessibility

- `Checkbox.Root` has `role="checkbox"` with `aria-checked="true" | "false" | "mixed"`.
- Push the `Space` key to change the checkbox.
- The `readonly` prop keeps the checkbox focusable, but it stops the state changes.

## API reference

<ApiReference api={api} />
