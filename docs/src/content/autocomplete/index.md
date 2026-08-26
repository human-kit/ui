---
title: Autocomplete
description: An always-visible, filterable list — a search input on top of a ListBox with virtual focus, no popover, and no open/closed state.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Multiple from './demos/multiple.svelte';
	import multipleSource from './demos/multiple.svelte?highlight';
	import api from './api.json';
</script>

# Autocomplete

This is a list that the user always sees and can filter. It is a search input above a ListBox. When the user types, the component filters the items locally. The arrow keys move a virtual focus through the list, but the DOM focus stays in the input. A ComboBox has a popover and an open state. An Autocomplete has neither.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

The inner list holds the selection. Put `selectionMode`, `value`, `defaultValue`, and `onChange` on `Autocomplete.List`, like a plain ListBox. The Autocomplete controls only the search text, the filter, and the virtual focus.

```svelte
<script>
	import { Autocomplete } from '@human-kit/ui';
</script>

<Autocomplete.Root aria-label="Fruits">
	<Autocomplete.Input aria-label="Search fruits" placeholder="Search…" />
	<Autocomplete.Status />
	<Autocomplete.List selectionMode="single" bind:value>
		<Autocomplete.Item id="apple">
			Apple
			<Autocomplete.ItemIndicator />
		</Autocomplete.Item>
		<Autocomplete.Empty />
	</Autocomplete.List>
</Autocomplete.Root>
```

## More than one selection

Put `selectionMode="multiple"` on `Autocomplete.List`. A selected item shows an indicator, and it stays selected while the user continues to filter.

<Demo source={multipleSource}><Multiple /></Demo>

## External filter

Set `filter={null}` on `Autocomplete.Root` to stop the local filter. Then calculate the list in your own code, for example from a server, and use `bind:inputValue`.

## Usage guidelines

- Put all of the parts in `Autocomplete.Root`.
- Put the selection props (`selectionMode`, `value`, `defaultValue`, and `onChange`) on `Autocomplete.List`.
- Use `inputValue` and `onInputChange` on `Autocomplete.Root` only when you need external state, for example an asynchronous filter on a server. If the server sends the filtered results, set `filter={null}` to stop the local filter.
- Give `Autocomplete.Input` an accessible label with `aria-label` or `aria-labelledby`.
- Use `Autocomplete.Empty` for the "no results" state. Use `Autocomplete.Status` to announce the number of the results to a screen reader.
- On a server, give `Autocomplete.Root` a stable `id`. Thus the ARIA ids stay the same.

## Accessibility

- The input has `role="searchbox"`. Its `aria-controls` attribute points at the list, and its `aria-activedescendant` attribute points at the item with the virtual focus. There is no popup, thus there is no `aria-expanded` attribute and no `aria-haspopup` attribute.
- The list has `role="listbox"`, and each item has `role="option"`.
- The `ArrowDown` key and the `ArrowUp` key move the virtual focus through the results. The `PageDown` key and the `PageUp` key move it by one page. The `Enter` key selects the item with the virtual focus. The `Escape` key removes the search text.
- `Autocomplete.Status` is a hidden `aria-live="polite"` region. It announces the number of the results.

## API reference

<ApiReference api={api} />
