# Separator

## Description

`Separator` is a line between two groups of content. A screen reader reads it as a break, the same as a native `<hr>`. It has no size of its own: give it a border or a background, and a width or a height. With a `value`, it is a window splitter the keyboard and the pointer move.

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
- Give `value` with `bind:value` for a window splitter, and size the pane before it from the value. Name it with `aria-label`, and point `aria-controls` at the pane.

## API reference

- `Separator`
  - `orientation?: 'horizontal' | 'vertical'` (`'horizontal'`)
  - `decorative?: boolean` (`false`)
  - `value?: number` (bindable), `min?: number` (`0`), `max?: number` (`100`), `step?: number` (`1`), `largeStep?: number` (`10`), `onValueChange?: (value: number) => void`, `aria-controls?: string`, `disabled?: boolean`
  - `element?: HTMLDivElement | null` (bindable)

## Accessibility

- The element is `role="separator"`. A vertical one has `aria-orientation="vertical"`: a separator is horizontal unless it says otherwise.
- `decorative` makes it `role="none"`, which a screen reader skips.
- A plain separator is not focusable. A splitter is a tab stop with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and a name. The arrows of its axis move it by `step`, or by `largeStep` with `Shift`. `Home` and `End` send it to the ends, and `Enter` folds and unfolds the pane. The horizontal arrows flip on a right-to-left page.
