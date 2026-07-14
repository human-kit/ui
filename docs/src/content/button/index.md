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

A headless native button with RAC-aligned pending semantics, pressed-state exposure, and modality-aware focus data attributes.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

A single part that renders a native `<button>`. The `children` snippet optionally receives the live render state.

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

`pending` keeps the button focusable while blocking activation and hover state, and announces the pending state through an internal polite live region. When `type="submit"` and `pending` is true, the rendered type switches to `button` to prevent form submission.

<Demo source={pendingSource}><Pending /></Demo>

## Usage guidelines

- Use native button props such as `type`, `name`, `value`, and form attributes directly on `Button.Root`.
- Use `pending` to keep the button focusable while blocking activation and hover state.
- Style interaction states with `data-hovered`, `data-pressed`, `data-focused`, `data-focus-visible`, `data-disabled`, and `data-pending`.
- Pending does not serialize `data-disabled`; it is represented by `data-pending`.

## Accessibility

- `Button.Root` renders a native `<button>`.
- `pending` applies `aria-disabled="true"`, preserves focusability, blocks press behavior, and announces the pending state politely.
- `data-focus-visible` follows the shared modality contract and is only exposed for keyboard or virtual focus.

## API reference

<ApiReference api={api} />
