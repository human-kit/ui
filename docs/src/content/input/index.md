---
title: Input
description: A headless native text input with modality-aware focus state, native disabled and read-only booleans, and data attributes for validation styling.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Validation from './demos/validation.svelte';
	import validationSource from './demos/validation.svelte?highlight';
	import api from './api.json';
</script>

# Input

A headless native text input with modality-aware focus state, native disabled and read-only booleans, and data attributes for validation and form styling.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

A single component that renders a native `<input>` (`type="text"` by default) and supports `bind:value`.

```svelte
<script>
	import { Input } from '@human-kit/svelte-components';
</script>

<Input aria-label="Email" placeholder="name@example.com" invalid={hasError} required />
```

## Validation

Use `disabled`, `readonly`, `invalid`, and `required` to control validation and interaction state while keeping native behavior. `invalid` maps to `aria-invalid` and `data-invalid`.

<Demo source={validationSource}><Validation /></Demo>

## Usage guidelines

- Use native input props like `type`, `name`, `value`, `defaultValue`, `placeholder`, and `autocomplete` directly on `Input`.
- Style state with `data-focused`, `data-focus-visible`, `data-hovered`, `data-disabled`, `data-readonly`, `data-invalid`, and `data-required`.

## Accessibility

- `Input` renders a native `<input>` with `type="text"` by default.
- `data-focus-visible` follows the shared modality contract and only appears for keyboard or virtual focus.
- `invalid` maps to `aria-invalid`, `readonly` maps to `readonly` and `aria-readonly`, and `required` maps to `required` and `aria-required`.

## API reference

<ApiReference api={api} />
