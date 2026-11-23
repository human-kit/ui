---
title: Chart Scales
description: The linear, time and band scales of the charts of @human-kit/ui — pure functions on their own subpaths, used as the type of a chart axis or on their own.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Band from './demos/band.svelte';
	import bandSource from './demos/band.svelte?highlight';
	import Functions from './demos/functions.svelte';
	import functionsSource from './demos/functions.svelte?highlight';
	import api from './api.json';
</script>

# Scales

A scale maps a value of the data to a position in pixels. The package has three scales. Each one is a pure function on its own subpath. Thus a chart includes only the scales that it imports.

| Scale         | Subpath                           | Values                |
| ------------- | --------------------------------- | --------------------- |
| `scaleLinear` | `@human-kit/ui/chart/scales/linear` | `number`              |
| `scaleTime`   | `@human-kit/ui/chart/scales/time`   | `Date`                |
| `scaleBand`   | `@human-kit/ui/chart/scales/band`   | `string` (categories) |

## As the type of an axis

Give the scale function as the `type` of `xScale` or `yScale`. The default type is `scaleLinear`.

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';
</script>

<Chart.Root
	data={rows}
	x="day"
	y="value"
	xScale={{ type: scaleTime }}
	yScale={{ domain: [0, 100] }}
>
	<!-- … -->
</Chart.Root>
```

The root does not choose the scale from the values. A choice from the values puts all of the scales in each bundle. In a development build, the root writes a warning when the x values are dates and the x scale is not a time scale. It also writes a warning when the values are strings and the scale is not a band scale.

The other options of a scale are on the [Chart](/docs/chart) page: `domain`, `zero`, `nice` and `padding`.

## Linear

`scaleLinear` maps numbers to positions in proportion. Its ticks are 1, 2 or 5 times a power of ten. A tick label has as many decimals as the step between the ticks.

## Time

`scaleTime` maps dates to positions in proportion. Its ticks are at calendar boundaries: years, quarters, months, Sundays, days, hours, minutes and seconds. It makes its labels with `Intl.DateTimeFormat`, and it does not include a calendar library.

A tick label shows only the largest calendar field that changes at the tick: "2025", "Mar", "Mar 5" or "9:00 AM". The name of a point shows the date in full, as precise as the data.

## Band

`scaleBand` divides the range into one band for each category. The order of the bands is the order of the first appearance of the categories in the data. The scale gives the middle of a band, and `bandwidth` gives its width.

`padding` is the space between two bands, as a fraction of a step. Half of it is at each end. The default is 0.2.

<Demo source={bandSource}><Band /></Demo>

## As pure functions

Each scale function also works without a chart. It takes a domain, a range and, for a band scale, the categories. It returns a `Scale`: a function from a value to a position, with the ticks and the formats of the scale.

<Demo source={functionsSource}><Functions /></Demo>

A value of a scale is a number. A date is its time in milliseconds, and a category is its index in `categories`.

## API reference

<ApiReference api={api} />
