---
title: TextArea
description: A headless native multiline text input with modality-aware focus state, disabled and read-only booleans, validation data attributes, and optional auto-resize.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# TextArea

This is a headless native text input with more than one line. It has a modality-aware focus state, the `disabled` and `readonly` booleans of React Aria Components, validation data attributes, and an optional automatic height.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`TextArea` has one part. The part makes a native `<textarea>` element. Each native textarea attribute goes directly to that element.

```svelte
<script>
	import { TextArea } from '@human-kit/ui';
</script>

<TextArea aria-label="Message" placeholder="Write your message..." required autoResize />
```

## States

The component shows the interaction state and the validation state in `data-*` attributes: `data-focused`, `data-focus-visible`, `data-hovered`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, and `data-autoresize`. Thus you write all of the styles in plain CSS or in utility classes.

## Automatic height

Set `autoResize` when the textarea must become larger with the content. Use `minRows` and `maxRows` to set the limits of the height. If you do not set `autoResize`, the native `rows` attribute and the manual resize control stay in operation.

## Usage guidelines

- Put the native textarea props (`name`, `value`, `placeholder`, `rows`, `cols`, `maxlength`, and `wrap`) directly on `TextArea`.
- Use `disabled`, `readonly`, `invalid`, and `required` to control the validation state and the interaction state. The native behavior stays correct.
- Set `autoResize` when the textarea must become larger with the content. Use `minRows` and `maxRows` to set the limits of the height.
- Write the styles for the state with `data-focused`, `data-focus-visible`, `data-hovered`, `data-disabled`, `data-readonly`, `data-invalid`, `data-required`, and `data-autoresize`.

## Accessibility

- `TextArea` makes a native `<textarea>` element, and it accepts `bind:value`.
- `data-focus-visible` obeys the shared modality contract. The component shows it only for a keyboard focus or a virtual focus.
- The `invalid` prop sets `aria-invalid`. The `readonly` prop sets `readonly` and `aria-readonly`. The `required` prop sets `required` and `aria-required`.
- The native textarea semantics already give the multiline textbox behavior. Thus you do not set `aria-multiline`.

## API reference

<ApiReference api={api} />
