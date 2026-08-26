---
title: Toggle
description: A headless two-state button with controlled and uncontrolled selected state, native button semantics, and modality-aware styling hooks.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# Toggle

This is a headless button with two states. You can control the selected state, or you can let the component control it. The component has native button semantics and modality-aware data attributes for the styles.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Toggle.Root` is the only part. It makes a native `<button type="button">` element with `aria-pressed`. Its children can be a snippet that receives the current render state.

```svelte
<script>
	import { Toggle } from '@human-kit/ui';
</script>

<Toggle.Root defaultSelected aria-label="Favorite">Favorite</Toggle.Root>
```

## Standalone buttons

The component shows each visual state in `data-*` attributes: `data-selected`, `data-pressed`, `data-hovered`, `data-focus-visible`, and `data-disabled`. Thus you write all of the styles in plain CSS or in utility classes. Use `defaultSelected` when the component controls the state.

## Controlled state

Bind `selected` when your own code controls the toggle. Use `onChange` to react when the user changes the state.

## Usage guidelines

- Use `selected` and `defaultSelected` for the state of the toggle.
- If you control or bind the state, `selected={undefined}` becomes `false`. To use `defaultSelected`, do not give a `selected` prop.
- Use `onChange` to react when the user changes the state.
- Use `value` as a stable identifier inside a `ToggleGroup`. The component puts `value` on the button, but `value` does not show the selected state.
- A toggle with only an icon must have an accessible name. Give it an `aria-label` or an `aria-labelledby` attribute.
- If the label changes with the state, keep the accessible name the same. Let `aria-pressed` announce the state.

## Accessibility

- `Toggle.Root` makes a native `<button type="button">` element.
- The component gives the selected state to assistive technology with `aria-pressed="true" | "false"`.
- The `Enter` key and the `Space` key activate the button, like a native button.
- `data-focus-visible` obeys the shared modality contract. The component shows it only for a keyboard focus or a virtual focus.

## API reference

<ApiReference api={api} />
