# Autocomplete

## Description

`Autocomplete` is an always-visible, filterable list: a search input on top of a
`ListBox`. As the user types, items are filtered locally; arrow keys move a
virtual focus through the list (via `aria-activedescendant`) while DOM focus stays
in the input. Unlike `ComboBox`, there is **no popover and no open/closed state**.

Selection lives in the inner list — pass `selectionMode`, `value`/`defaultValue`
and `onChange` to `Autocomplete.List`, exactly like a plain `ListBox`. The
Autocomplete only owns the search query, filtering and virtual focus.

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
