# Separator

## Description

`Separator` is a line between two groups of content. A screen reader reads it as a break, the same as a native `<hr>`. It has no size of its own: give it a border or a background, and a width or a height.

## Anatomy

- `Separator`

```svelte
<Separator class="h-px w-full bg-neutral-200" />
<Separator orientation="vertical" class="h-6 w-px bg-neutral-200" />
```

## Usage guidelines

- Use `orientation="vertical"` for a line between two items side by side, such as in a toolbar.
- Use `decorative` for a line that repeats a break the content already makes, such as a border between two sections with headings. A screen reader then skips it.
- Give the line a size with CSS. `data-orientation` is on the element for your styles.

## API reference

- `Separator`
  - `orientation?: 'horizontal' | 'vertical'` (`'horizontal'`)
  - `decorative?: boolean` (`false`)
  - `element?: HTMLDivElement | null` (bindable)

## Accessibility

- The element is `role="separator"`. A vertical one has `aria-orientation="vertical"`: a separator is horizontal unless it says otherwise.
- `decorative` makes it `role="none"`, which a screen reader skips.
- It is not focusable. A separator that the user moves, such as a window splitter, is a different pattern.
