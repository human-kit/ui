---
title: Progress
description: The status of a task that takes time, as a bar with a name and a value for the screen reader, an indeterminate state, a formatted value in any unit, and the numbers for a shape of your own.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Indeterminate from './demos/indeterminate.svelte';
	import indeterminateSource from './demos/indeterminate.svelte?highlight';
	import Unit from './demos/unit.svelte';
	import unitSource from './demos/unit.svelte?highlight';
	import Ring from './demos/ring.svelte';
	import ringSource from './demos/ring.svelte?highlight';
	import api from './api.json';
</script>

# Progress

`Progress` shows the status of a task that takes time. It holds a value between `min` and `max`, or no value while the end of the task is not known. A screen reader reads its name and its value, the same as a native progress bar.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Progress.Root` is the `role="progressbar"` element. It holds the numbers, and it gives them to the parts in it.

`Progress.Label` names the bar. `Progress.Track` is the full length of the task, and `Progress.Indicator` fills the part of it that the task has done. `Progress.Value` shows the value as text.

```svelte
<script>
	import { Progress } from '@human-kit/ui';
</script>

<Progress.Root value={31}>
	<Progress.Label>Export data</Progress.Label>
	<Progress.Value />
	<Progress.Track>
		<Progress.Indicator />
	</Progress.Track>
</Progress.Root>
```

## Value

Give `value` between `min` and `max`. The defaults are 0 and 100. A value out of the range is held at the near end. The progress is complete when the value reaches `max`, and every part gets `data-complete` for your styles.

The indicator sizes itself: the width from the start edge of a horizontal track, and the height from the bottom of a vertical one. The start edge follows the direction of the text, thus a right-to-left page fills from the right.

## Indeterminate

Give `value={null}` while the end of the task is not known. The bar then has no `aria-valuenow`: a number for a task with no known end would be false. The indicator gets no size, and every part gets `data-indeterminate`. Animate the indicator with CSS.

<Demo source={indeterminateSource}><Indeterminate /></Demo>

## Format

Without `format`, the text of the value is the position in the range as a percentage: `31%` for 31 of 100, and for 62 of 200. Give the options of `Intl.NumberFormat` to show the value itself, in a unit. The text follows the locale of `LocaleProvider`.

`Progress.Value` shows that text. Give it children to shape the text: they get the formatted value, the value, and the status. Give `getValueText` to shape the text a screen reader gets, which is the formatted value by default.

<Demo source={unitSource}><Unit /></Demo>

## A shape of your own

Read `percent` and `status` from `bind:context` for a shape that is not a bar, such as a ring. The root stays the progress bar, thus the screen reader gets the same name and numbers.

<Demo source={ringSource}><Ring /></Demo>

## Usage guidelines

- Give the bar a name with `Progress.Label`, or with `aria-label` on the root.
- Use a progress bar for a task. For a measurement that is not a task, such as the disk in use, the correct role is `meter`, which this component does not give.
- Put `aria-busy="true"` on the region that the task fills. The bar says how far the task is; it does not say what the task changes.
- A value change makes no announcement. A screen reader user reads the bar at will. Announce the end of a long task yourself, with a live region.

## Accessibility

- `Progress.Root` has `role="progressbar"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`.
- An indeterminate progress has no `aria-valuenow` and no `aria-valuetext`.
- `Progress.Label` writes `aria-labelledby` on the bar. An `aria-labelledby` that you give stands. The label renders a `<span>`, and not a `<label>`: a `<label>` names a form control, and a progress bar is none.
- `Progress.Value` is `aria-hidden`. The bar already gives the value to the screen reader, and a second copy would read twice.
- The bar takes no focus.

## API reference

<ApiReference api={api} />
