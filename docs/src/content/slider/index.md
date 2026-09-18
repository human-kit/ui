---
title: Slider
description: A form field that picks a number, or a range of numbers, on a track. It has the keyboard of a native range input, a native input in each thumb for the form and for screen readers, and text in the locale.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Range from './demos/range.svelte';
	import rangeSource from './demos/range.svelte?highlight';
	import Vertical from './demos/vertical.svelte';
	import verticalSource from './demos/vertical.svelte?highlight';
	import api from './api.json';
</script>

# Slider

`Slider` is a form field with a number on a track. The user moves a thumb with the pointer or with the keyboard. A range has more than one thumb. Each thumb holds a native `<input type="range">`, thus a form sends the value, and a screen reader reads the thumb as a native slider.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Slider.Root` holds the value and the range. `Slider.Track` is the rail, and a press on it moves the nearest thumb. `Slider.Fill` is the part of the track before the thumb, or between the two thumbs of a range. `Slider.Thumb` is the handle of one value.

`Slider.Label` names the field. `Slider.Output` shows the value as text.

```svelte
<script>
	import { Slider } from '@human-kit/ui';
</script>

<Slider.Root name="volume">
	<Slider.Label>Volume</Slider.Label>
	<Slider.Output />
	<Slider.Track>
		<Slider.Fill />
		<Slider.Thumb />
	</Slider.Track>
</Slider.Root>
```

## Value

Use `bind:value` to give the root your state. Use `value` with `onChange` and `controlledValue` to hold the state yourself. The root then reports each change, and it does not write `value` back. Thus you can refuse a change.

Use `defaultValue` when the root holds its own state. The default is `min`.

`onChange` runs on each change, also on each move of a drag. `onChangeEnd` runs when a sequence of changes ends: after a key press, and after a drag. Use it for work that must not run on each move, for example a request.

## Range

Give an array as the value, in ascending order, and put one `Slider.Thumb` in the track for each number. A thumb cannot pass its neighbors. `minStepsBetweenThumbs` keeps a distance between them.

The thumbs take their indexes in order. Give `index` to a thumb when you render the thumbs in a different order.

<Demo source={rangeSource}><Range /></Demo>

## Steps

`step` is the distance between two values. Each value from the pointer snaps to a step from `min`. `largeStep` is the distance of `PageUp`, `PageDown` and `Shift+Arrow`. The default is one tenth of the range, and never less than one step.

## Text

`Slider.Output` and the text that a screen reader reads come from `Intl.NumberFormat`, in the locale of `LocaleProvider`. Give `formatOptions` for a unit, a currency or a percent. Two values of a range are one text in the locale, for example `$200–650`. Give `getValueText` when a screen reader must read a different text, for example "3 stars".

## Orientation

Set `orientation="vertical"` for a vertical track. The bottom edge is `min`. `ArrowUp` and `ArrowRight` give more, and `ArrowDown` and `ArrowLeft` give less, in the two orientations. In a right-to-left context the horizontal arrows follow the direction of the text.

<Demo source={verticalSource}><Vertical /></Demo>

## Styles

The parts have no styles. Each part shows its state in `data-*` attributes: `data-orientation`, `data-disabled`, `data-readonly`, `data-invalid` and `data-dragging`. The thumb has `data-index`, `data-focused` and `data-focus-visible`.

`Slider.Track` is `position: relative`, and `Slider.Thumb` and `Slider.Fill` are `position: absolute`, at a position in percent of the value. Give the track a size, and give the thumb a size. The thumb is centered on its position.

## Forms

Give the root a `name`. Each native input sends its value with that name, thus a range sends one entry per thumb. Give `name` to a `Slider.Thumb` for a name of its own. A reset of the form returns the slider to its first value.

## Keyboard

On a thumb:

- `ArrowRight` and `ArrowUp` give one step more. `ArrowLeft` and `ArrowDown` give one step less.
- `PageUp` and `PageDown`, or `Shift` with an arrow, move one large step.
- `Home` and `End` move to `min` and to `max`.
- `Tab` moves to the next thumb, and then out of the slider.

## Accessibility

- The root is a `role="group"` named by `Slider.Label`, by `aria-labelledby` or by `aria-label`.
- Each thumb holds a native `<input type="range">`. It has the focus, `aria-valuenow`, `aria-valuetext`, `aria-orientation` and the name of the field. A screen reader on a phone changes it with a swipe, and the slider takes that change.
- In a range of two thumbs, each thumb has a name of its own before the name of the field: "Minimum" and "Maximum" in the locale, or the `aria-label` you give the thumb.
- `Slider.Output` is an `<output>` for the native inputs, with `aria-live="off"`. The thumb reads its own value, and a live region would read it a second time.
- A press on the track puts the focus on the thumb without a focus ring. A key press after it shows the ring.
- `readonly` keeps the thumbs in the tab order, with `aria-readonly`, and refuses each change. `disabled` disables the native inputs.

## API reference

<ApiReference api={api} />
