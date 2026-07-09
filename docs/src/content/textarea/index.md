---
title: TextArea
description: A headless native multiline text input with modality-aware focus state, disabled and read-only booleans, validation data attributes, and optional auto-resize.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import States from './demos/states.svelte';
	import statesSource from './demos/states.svelte?highlight';
	import AutoResize from './demos/autoresize.svelte';
	import autoResizeSource from './demos/autoresize.svelte?highlight';
	import api from './api.json';
</script>

# TextArea

A headless native multiline text input with modality-aware focus state, RAC-style disabled and read-only booleans, validation data attributes, and optional auto-resize behavior.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`TextArea` is a single-part component that renders a native `<textarea>`. All native textarea attributes pass straight through.

```svelte
<script>
	import { TextArea } from '@human-kit/ui';
</script>

<TextArea aria-label="Message" placeholder="Write your message..." required autoResize />
```

## States

Interaction and validation state is exposed through `data-*` attributes — `data-focused`, `data-focus-visible`, `data-hovered`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, and `data-autoresize` — so all styling is done with plain CSS or utility classes.

<Demo source={statesSource}><States /></Demo>

## Auto-resize

Enable `autoResize` when the textarea should grow with content, and bound the height with `minRows` and `maxRows`. Leave it off to keep native `rows` and manual resize behavior.

<Demo source={autoResizeSource}><AutoResize /></Demo>

## Usage guidelines

- Use native textarea props like `name`, `value`, `placeholder`, `rows`, `cols`, `maxlength`, and `wrap` directly on `TextArea`.
- Use `disabled`, `readonly`, `invalid`, and `required` to control validation and interaction state while keeping native behavior.
- Enable `autoResize` when the textarea should grow with content. Use `minRows` and `maxRows` to bound the height.
- Style state with `data-focused`, `data-focus-visible`, `data-hovered`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, and `data-autoresize`.

## Accessibility

- `TextArea` renders a native `<textarea>` and supports `bind:value`.
- `data-focus-visible` follows the shared modality contract and only appears for keyboard or virtual focus.
- `invalid` maps to `aria-invalid`, `readonly` maps to `readonly` and `aria-readonly`, and `required` maps to `required` and `aria-required`.
- Native textarea semantics already expose multiline textbox behavior, so no manual `aria-multiline` is needed.

## API reference

<ApiReference api={api} />
