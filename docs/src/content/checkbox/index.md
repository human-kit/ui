---
title: Checkbox
description: A composable tri-state checkbox with separate checked and indeterminate bindings, hidden input form support, and headless indicator rendering.
---

<script>
	import Demo from '$lib/docs/demo.svelte';
	import ApiReference from '$lib/docs/api-reference.svelte';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import States from './demos/states.svelte';
	import statesSource from './demos/states.svelte?highlight';
	import Indeterminate from './demos/indeterminate.svelte';
	import indeterminateSource from './demos/indeterminate.svelte?highlight';
	import Form from './demos/form.svelte';
	import formSource from './demos/form.svelte?highlight';
	import api from './api.json';
</script>

# Checkbox

A composable tri-state checkbox with separate checked and indeterminate bindings, hidden input form support, and headless indicator rendering.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

The checkbox is assembled from two parts. `Checkbox.Root` renders the control (and a hidden checkbox input for form integration); `Checkbox.Indicator` renders the check or mixed mark and only mounts while the checkbox is checked or indeterminate.

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

Every visual state is exposed through `data-*` attributes on both parts, so all styling — including `disabled`, `readonly`, and `indeterminate` — is done with plain CSS or utility classes.

<Demo source={statesSource}><States /></Demo>

## Indeterminate

The mixed state has its own `indeterminate` / `defaultIndeterminate` binding and takes precedence over `checked`. The first user toggle from the indeterminate state resolves to checked.

<Demo source={indeterminateSource}><Indeterminate /></Demo>

## Forms

`Checkbox.Root` keeps a hidden checkbox input in sync: give it a `name` and `value` and the pair is submitted when the checkbox is checked. Unchecked and indeterminate states submit no entry.

<Demo source={formSource}><Form /></Demo>

## Usage guidelines

- Use `checked` / `defaultChecked` for the checked state and `indeterminate` / `defaultIndeterminate` for the mixed state.
- `indeterminate` takes precedence over `checked`. When both are `true`, the checkbox is exposed as indeterminate.
- Use `value` only for form submission through the hidden native input; it does not represent the visual state.
- Wrap the checkbox in a native `<label>` for the simplest accessible labeling pattern, or point a sibling `label[for]` at the checkbox `id`.

## Accessibility

- `Checkbox.Root` exposes `role="checkbox"` with `aria-checked="true" | "false" | "mixed"`.
- Press `Space` to toggle the checkbox.
- `readonly` keeps the checkbox focusable while preventing state changes.

## API reference

<ApiReference {api} />
