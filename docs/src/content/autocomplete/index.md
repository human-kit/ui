---
title: Autocomplete
description: An always-visible, filterable list — a search input on top of a ListBox with virtual focus, no popover, and no open/closed state.
---

<script>
	import { Demo, ApiReference } from '@human-kit/humandocs/components';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Multiple from './demos/multiple.svelte';
	import multipleSource from './demos/multiple.svelte?highlight';
	import External from './demos/external.svelte';
	import externalSource from './demos/external.svelte?highlight';
	import api from './api.json';
</script>

# Autocomplete

An always-visible, filterable list: a search input on top of a ListBox. As the user types, items are filtered locally; arrow keys move a virtual focus through the list while DOM focus stays in the input. Unlike ComboBox, there is no popover and no open/closed state.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

Selection lives in the inner list — pass `selectionMode`, `value` / `defaultValue` and `onChange` to `Autocomplete.List`, exactly like a plain ListBox. The Autocomplete only owns the search query, filtering and virtual focus.

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

## Multiple selection

Pass `selectionMode="multiple"` to `Autocomplete.List`. Selected items show an indicator and stay selected as you keep filtering.

<Demo source={multipleSource}><Multiple /></Demo>

## External filtering

Set `filter={null}` on `Autocomplete.Root` to disable local filtering and compute the list yourself (e.g. from a backend) using `bind:inputValue`.

<Demo source={externalSource}><External /></Demo>

## Usage guidelines

- Wrap all parts in `Autocomplete.Root`.
- Put selection props (`selectionMode`, `value`, `defaultValue`, `onChange`) on `Autocomplete.List`.
- Use controlled `inputValue` + `onInputChange` on `Autocomplete.Root` only when you need external state (e.g. server-side/async filtering). Set `filter={null}` to disable local filtering when results come pre-filtered from a backend.
- Provide an accessible label on `Autocomplete.Input` (`aria-label` or `aria-labelledby`).
- Render `Autocomplete.Empty` for the "no results" state and `Autocomplete.Status` to announce the result count to screen readers.
- Provide a stable `id` on `Autocomplete.Root` in SSR environments to keep ARIA ids deterministic.

## Accessibility

- The input is a `role="searchbox"` with `aria-controls` pointing to the list and `aria-activedescendant` pointing to the highlighted item. There is no `aria-expanded` / `aria-haspopup` because there is no popup.
- The list is a `role="listbox"`; items are `role="option"`.
- `ArrowDown` / `ArrowUp` move the virtual focus through results, `PageDown` / `PageUp` jump by a page, `Enter` selects the highlighted item, and `Escape` clears the query.
- `Autocomplete.Status` is a visually-hidden `aria-live="polite"` region that announces the result count.

## API reference

<ApiReference api={api} />
