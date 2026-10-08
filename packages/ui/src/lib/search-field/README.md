# SearchField

A text input for a search query. The `Escape` key and a clear button empty the text, and the `Enter` key submits the query.

## Anatomy

```svelte
<SearchField.Root>
	<SearchField.Label />
	<SearchField.Input />
	<SearchField.Clear />
</SearchField.Root>
```

## Usage guidelines

- Give the input an accessible name. Use `SearchField.Label`, or put `aria-label` or `aria-labelledby` on `SearchField.Input`.
- Use `bind:value` for the state in the two directions. The value is always a string.
- Use `onSubmit` to start the search on `Enter`. In a form, the form also submits.
- Use `onClear` to know when the `Escape` key or the clear button empties the text.
- Use `name` on `Root` to submit the text in an HTML form.
- Use the `data-empty` attribute to hide the clear button while the text is empty.

## Accessibility

- `SearchField.Input` makes an `<input type="search">`, which has the `searchbox` role.
- The `Escape` key empties the text and keeps the key in the field. When the text is already empty, the key goes on, thus a dialog around the field can close.
- The clear button is not in the tab order, because the `Escape` key does the same operation. A press on it keeps the focus in the input.
- The localized name of the clear button is "Clear search". Put an `aria-label` on `SearchField.Clear` to change it.
