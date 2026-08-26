# Autocomplete

## Description

`Autocomplete` is a list that the user always sees and can filter: a search input above a
`ListBox`. When the user types, the component filters the items locally. The arrow keys
move a virtual focus through the list with `aria-activedescendant`, and the DOM focus
stays in the input. A `ComboBox` has a popover and an open state. An `Autocomplete` has
**neither**.

The inner list holds the selection. Put `selectionMode`, `value`, `defaultValue`, and `onChange` on `Autocomplete.List`, like a plain `ListBox`. The Autocomplete controls only the search text, the filter, and the virtual focus.

## Usage guidelines

- Wrap all parts in `Autocomplete.Root`.
- Put selection props (`selectionMode`, `value`, `defaultValue`, `onChange`) on
  `Autocomplete.List`.
- Use controlled `inputValue` + `onInputChange` on `Autocomplete.Root` only when
  you need external state (e.g. server-side/async filtering). Set `filter={null}`
  to disable local filtering when results come pre-filtered from a backend.
- Provide an accessible label on `Autocomplete.Input` (`aria-label` or
  `aria-labelledby`).
- Render `Autocomplete.Empty` for the "no results" state and `Autocomplete.Status`
  to announce the result count to screen readers.
- Provide a stable `id` on `Autocomplete.Root` in SSR environments to keep ARIA
  ids deterministic.

## Anatomy

```svelte
<Autocomplete.Root aria-label="Fruits">
	<Autocomplete.Input aria-label="Search fruits" placeholder="Search…" />
	<Autocomplete.Status />
	<Autocomplete.List selectionMode="single" bind:value>
		<Autocomplete.Item id="apple">
			Apple
			<Autocomplete.ItemIndicator />
		</Autocomplete.Item>
		<Autocomplete.Item id="banana">
			Banana
			<Autocomplete.ItemIndicator />
		</Autocomplete.Item>
		<Autocomplete.Empty />
	</Autocomplete.List>
</Autocomplete.Root>
```

- `Autocomplete.Root`
- `Autocomplete.Input`
- `Autocomplete.List`
- `Autocomplete.Item`
- `Autocomplete.ItemIndicator`
- `Autocomplete.Empty`
- `Autocomplete.Status`

## Keyboard

- `ArrowDown` / `ArrowUp` — move the virtual focus through results.
- `PageDown` / `PageUp` — jump by a page of results.
- `Enter` — select the highlighted item.
- `Escape` — clear the query.

## Accessibility

- The input is a `role="searchbox"` with `aria-controls` pointing to the list and
  `aria-activedescendant` pointing to the highlighted item. There is no
  `aria-expanded`/`aria-haspopup` because there is no popup.
- The list is a `role="listbox"`; items are `role="option"`.
- `Autocomplete.Status` is a visually-hidden `aria-live="polite"` region.
