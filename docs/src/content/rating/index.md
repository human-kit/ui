---
title: Rating
description: A form field for a score on a small scale, with whole or half items, a preview that follows the pointer, the keyboard of a radio group, and a hidden input for the form.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Half from './demos/half.svelte';
	import halfSource from './demos/half.svelte?highlight';
	import ReadOnly from './demos/readonly.svelte';
	import readOnlySource from './demos/readonly.svelte?highlight';
	import api from './api.json';
</script>

# Rating

`Rating` is a form field with a score on a small scale, for example five stars. The user answers with a press on an item, or with the arrows. The value follows the pointer before the press, thus the reader sees the answer of a press before it.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Rating.Root` holds the value and the keyboard. `Rating.Item` is one item of the scale, and you give one for each item of `count`. `Rating.Label` names the field, and `Rating.Output` shows the value as text.

```svelte
<script>
	import { Rating } from '@human-kit/ui';
</script>

<Rating.Root name="quality">
	<Rating.Label>Quality</Rating.Label>
	<Rating.Output />
	{#each { length: 5 } as _, index (index)}
		<Rating.Item />
	{/each}
</Rating.Root>
```

## Value

Use `bind:value` to give the root your state. Use `value` with `onChange` and `controlledValue` to hold the state yourself. The root then reports each change, and it does not write `value` back. Thus you can refuse a change.

Use `defaultValue` when the root holds its own state. The default is 0, which is no score.

`onChange` runs on each change. `onChangeEnd` runs when a sequence of changes ends: at the release of a key, and at a press on an item. A held key reports one end, at its release.

`allowClear` is on. A press on the item of the value puts the value back to 0, and so do `Delete` and `Backspace`. Set it to `false` for a field that must hold a score after the first press.

## Two shapes, one component

With a precision of 1 the root is a radio group, and each item is a radio with its own name. That is what a screen reader reads best: each value is one item, and the focus follows the value.

With a smaller precision the root is a slider, with `aria-valuenow` and `aria-valuetext`. A radio group cannot say 3.5. The root is the one tab stop then, and the items are decoration.

The keyboard is the same in the two shapes. The arrows step by the precision, `Home` goes to the first item, and `End` goes to the last one. The horizontal arrows follow the text direction.

## Half items

Give `precision={0.5}`. A press on the left half of an item gives the half, and a press on the right half gives the whole item. The value that follows the pointer does the same.

<Demo source={halfSource}><Half /></Demo>

## Style

Each item carries `--rating-item-fill`, from 0 to 1: 0 for an empty item, 0.5 for a half one, and 1 for a full one. A shape over the item with `width: calc(var(--rating-item-fill) * 100%)` gives you the half star, and no second element is necessary.

The root carries `--rating-value`, `--rating-display-value` and `--rating-count`. `--rating-display-value` is the value under the pointer, thus your CSS can answer the pointer without a state of its own.

Each item shows its state in `data-selected`, `data-highlighted`, `data-partial`, `data-focused` and `data-focus-visible`.

## A score that is only to read

`readonly` keeps the items in the tab order and stops each change. Use it for the score of somebody else, for example in a list of reviews. Give `getValueText` a text that says whose score it is.

<Demo source={readOnlySource}><ReadOnly /></Demo>

## Forms

Give `name` for the value of the field. The root renders a hidden input with the value as a number, and a `<form>` reset takes the first value back. `required` marks the field as necessary, and `invalid` marks the value as wrong.

## API reference

<ApiReference api={api} />
