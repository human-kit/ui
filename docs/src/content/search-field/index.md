---
title: SearchField
description: A search input with a localized clear button, Escape to clear, Enter to submit, and native form support.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Submit from './demos/submit.svelte';
	import submitSource from './demos/submit.svelte?highlight';
	import api from './api.json';
</script>

# SearchField

This is a text input for a search query. The `Escape` key and a clear button empty the text, and the `Enter` key submits the query.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`SearchField.Root` holds the text and gives the state to each part. `Label` names the input. `Input` is the native search input. `Clear` is the button that empties the text.

```svelte
<script>
	import { SearchField } from '@human-kit/ui';
</script>

<SearchField.Root>
	<SearchField.Label />
	<SearchField.Input />
	<SearchField.Clear />
</SearchField.Root>
```

## Submit and clear

`onSubmit` receives the text when the user presses `Enter`. `onClear` tells you when the `Escape` key or the clear button empties the text. Inside a form, `Enter` also submits the form, and `name` on `Root` gives the text a name in the form data.

<Demo source={submitSource}><Submit /></Demo>

## Usage guidelines

- Give the input an accessible name. Use `SearchField.Label`, or put `aria-label` or `aria-labelledby` on `SearchField.Input`.
- Use `bind:value` for the state in the two directions. The value is always a string.
- Use the `data-empty` attribute to hide the clear button while the text is empty. Use `visibility: hidden` and not `display: none`, thus the layout does not move.
- Some browsers show their own clear button in a search input. Hide it with the `::-webkit-search-cancel-button` pseudo-element if you show `SearchField.Clear`.

## Accessibility

- `SearchField.Input` makes an `<input type="search">`, which has the `searchbox` role. It also sets `enterkeyhint="search"` for the virtual keyboard.
- The `Escape` key empties the text and stops the key. When the text is already empty, the key goes on, thus a dialog or a popover around the field can close.
- A key in an IME composition belongs to the composition. Thus `Escape` and `Enter` do not clear or submit while the user composes text.
- The clear button is not in the tab order, because the `Escape` key does the same operation. A screen reader can still find it, and `aria-controls` points it at the input.
- A press on the clear button keeps the focus in the input. On a phone, the virtual keyboard stays open.
- The name of the clear button is "Clear search", in the language of the `LocaleProvider`. Put an `aria-label` on `SearchField.Clear` to change it.

## API reference

<ApiReference api={api} />
