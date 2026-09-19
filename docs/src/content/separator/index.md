---
title: Separator
description: A line between two groups of content, which a screen reader reads as a break, horizontal or vertical, decorative and skipped, or a window splitter the keyboard and the pointer move.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Splitter from './demos/splitter.svelte';
	import splitterSource from './demos/splitter.svelte?highlight';
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

## A window splitter

Give `value` for a separator the user moves: the size of the pane before it, as a number between `min` and `max`. Use `bind:value`, and give the pane its size from it. The splitter is then a tab stop with `aria-valuenow`, and it has a name from `aria-label`. Give `aria-controls` the id of the pane.

The arrow keys of its axis move it by `step`, and by `largeStep` with `Shift`. `Home` and `End` send it to the ends. `Enter` folds the pane to `min`, and unfolds it to where it was. The pointer drags it along its parent: a move of a fifth of the parent is a fifth of the range. `data-dragging` is on it through the drag, and `data-focus-visible` with the keyboard focus.

<Demo source={splitterSource}><Splitter /></Demo>

## Usage guidelines

- Give the line a size with CSS: a height and a width, or a border.
- Use `decorative` when the content around the line already tells the reader where one group ends.
- Give a splitter a name with `aria-label`, such as "Resize the file list", and a width the pointer can find.

## Accessibility

- The element is `role="separator"`. A vertical one has `aria-orientation="vertical"`: a separator is horizontal unless it says otherwise.
- `decorative` makes it `role="none"`, out of the accessibility tree.
- A plain separator has no tab stop. A splitter has one, with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-controls` and a name. The keyboard moves it: the arrows, `Home`, `End` and `Enter`.
- On a right-to-left page the horizontal arrows flip. `ArrowLeft` grows the pane before a vertical splitter, because that pane is on the right.

## API reference

<ApiReference api={api} />
