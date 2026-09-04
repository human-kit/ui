---
title: Input
description: A headless native text input with modality-aware focus state, native disabled and read-only booleans, and data attributes for validation styling.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# Input

This is a headless native text input. It has a modality-aware focus state, the native `disabled` and `readonly` booleans, and data attributes for the validation styles and the form styles.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

The component has one part. The part makes a native `<input>` element with the type `text`, and it accepts `bind:value`.

```svelte
<script>
	import { Input } from '@human-kit/ui';
</script>

<Input aria-label="Email" placeholder="name@example.com" invalid={hasError} required />
```

## Validation

Use `disabled`, `readonly`, `invalid`, and `required` to control the validation state and the interaction state. The native behavior stays correct. The `invalid` prop sets `aria-invalid` and `data-invalid`.

## Usage guidelines

- Put the native input props (`type`, `name`, `value`, `defaultValue`, `placeholder`, and `autocomplete`) directly on `Input`.
- Write the styles for the state with `data-focused`, `data-focus-visible`, `data-hovered`, `data-disabled`, `data-readonly`, `data-invalid`, and `data-required`.

## Accessibility

- `Input` makes a native `<input>` element. The default type is `text`.
- `data-focus-visible` obeys the shared modality contract. The component shows it only for a keyboard focus or a virtual focus.
- The `invalid` prop sets `aria-invalid`. The `readonly` prop sets `readonly` and `aria-readonly`. The `required` prop sets `required` and `aria-required`.

## API reference

<ApiReference api={api} />
