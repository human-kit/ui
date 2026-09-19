---
title: Separator
description: A line between two groups of content, which a screen reader reads as a break, horizontal or vertical, or decorative and skipped.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# Separator

`Separator` is a line between two groups of content. A screen reader reads it as a break, the same as a native `<hr>`. It has no size of its own: give it a border or a background, and a width or a height.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

The component has one part. It renders a `<div>` with `role="separator"`.

```svelte
<script>
	import { Separator } from '@human-kit/ui';
</script>

<Separator class="h-px w-full bg-neutral-200" />
```

## Orientation

A separator is horizontal by default: it sits between two blocks, one above the other. Give `orientation="vertical"` for a line between two items side by side, such as in a toolbar. The element then has `aria-orientation="vertical"`, and `data-orientation` is on it for your styles in both cases.

## Decorative

Some lines repeat a break the content already makes, such as a border between two sections with headings. A screen reader would read two breaks. Give `decorative` to such a line: it becomes `role="none"`, and the screen reader skips it.

## Usage guidelines

- Give the line a size with CSS: a height and a width, or a border.
- Use `decorative` when the content around the line already tells the reader where one group ends.
- A separator that the user moves, such as a window splitter, is a different pattern. This one is not focusable.

## Accessibility

- The element is `role="separator"`. A vertical one has `aria-orientation="vertical"`: a separator is horizontal unless it says otherwise.
- `decorative` makes it `role="none"`, out of the accessibility tree.
- It has no tab stop.

## API reference

<ApiReference api={api} />
