---
title: Button
description: A headless native button with pending semantics, pressed-state exposure, and modality-aware focus data attributes.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Pending from './demos/pending.svelte';
	import pendingSource from './demos/pending.svelte?highlight';
	import api from './api.json';
</script>

# Button

This is a headless native button. It shows its pressed state and its modality-aware focus state in data attributes. Its pending semantics agree with React Aria Components.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

The component has one part. The part makes a native `<button>` element. The `children` snippet can receive the live render state.

```svelte
<script>
	import { Button } from '@human-kit/ui';
</script>

<Button.Root>
	{#snippet children({ pending, pressed })}
		{#if pending}
			Saving…
		{:else}
			Save
		{/if}
	{/snippet}
</Button.Root>
```

## Pending state

The `pending` prop keeps the button focusable, but it stops the activation and the hover state. An internal polite live region announces the pending state. If the type is `submit` and `pending` is `true`, the component makes the element with the type `button`. Thus the form does not submit.

<Demo source={pendingSource}><Pending /></Demo>

## Usage guidelines

- Put the native button props (`type`, `name`, `value`, and the form attributes) directly on `Button.Root`.
- Use `pending` to keep the button focusable, but to stop the activation and the hover state.
- Write the styles for the interaction states with `data-hovered`, `data-pressed`, `data-focused`, `data-focus-visible`, `data-disabled`, and `data-pending`.
- The `pending` state does not write `data-disabled`. It writes `data-pending`.

## Accessibility

- `Button.Root` makes a native `<button>` element.
- The `pending` prop sets `aria-disabled="true"`, keeps the element focusable, stops the press behavior, and announces the pending state politely.
- `data-focus-visible` obeys the shared modality contract. The component shows it only for a keyboard focus or a virtual focus.

## API reference

<ApiReference api={api} />
