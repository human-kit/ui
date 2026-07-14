---
title: Toggle
description: A headless two-state button with controlled and uncontrolled selected state, native button semantics, and modality-aware styling hooks.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Buttons from './demos/buttons.svelte';
	import buttonsSource from './demos/buttons.svelte?highlight';
	import Controlled from './demos/controlled.svelte';
	import controlledSource from './demos/controlled.svelte?highlight';
	import api from './api.json';
</script>

# Toggle

A headless two-state button with controlled and uncontrolled selected state, native button semantics, and modality-aware styling hooks.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Toggle.Root` is the only part: a native `<button type="button">` with `aria-pressed`. Its children can optionally be a snippet that receives the current render state.

```svelte
<script>
	import { Toggle } from '@human-kit/ui';
</script>

<Toggle.Root defaultSelected aria-label="Favorite">Favorite</Toggle.Root>
```

## Standalone buttons

Every visual state is exposed through `data-*` attributes — `data-selected`, `data-pressed`, `data-hovered`, `data-focus-visible`, `data-disabled` — so all styling is done with plain CSS or utility classes. Use `defaultSelected` for uncontrolled state.

<Demo source={buttonsSource}><Buttons /></Demo>

## Controlled state

Bind `selected` to drive the toggle externally, and use `onChange` to react to user-driven changes.

<Demo source={controlledSource}><Controlled /></Demo>

## Usage guidelines

- Use `selected` / `defaultSelected` for the toggle state.
- In controlled or bound usage, `selected={undefined}` syncs as `false`; omit `selected` to use `defaultSelected`.
- Use `onChange` to react to user-driven state changes.
- Use `value` as a stable identifier for composition with `ToggleGroup`; it is forwarded to the button and does not represent the selected state.
- Icon-only toggles must provide an accessible name through `aria-label` or `aria-labelledby`.
- If the visible label changes with state, keep the accessible name stable and let `aria-pressed` announce the state.

## Accessibility

- `Toggle.Root` renders a native `<button type="button">`.
- The selected state is exposed to assistive technology with `aria-pressed="true" | "false"`.
- Native keyboard activation is supported with `Enter` and `Space`.
- `data-focus-visible` follows the shared modality contract and is only exposed for keyboard or virtual focus.

## API reference

<ApiReference api={api} />
