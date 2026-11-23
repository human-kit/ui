---
title: Chart.Area
description: Chart.Area fills the space below each series, side by side or stacked — an accessible Svelte area chart with keyboard focus on every point.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Stacked from './demos/stacked.svelte';
	import stackedSource from './demos/stacked.svelte?highlight';
	import api from './api.json';
</script>

# Area

`Chart.Area` fills the space between each series and zero. Each row is a point on the top line of the area. The points are focus targets, but they show only when they have the focus.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';
</script>

<Chart.Root data={rows} x="day" y="requests" xScale={{ type: scaleTime }}>
	<Chart.Title>Requests per day</Chart.Title>
	<Chart.Plot>
		<Chart.Area />
	</Chart.Plot>
</Chart.Root>
```

The mark makes a `<g>` with one group for each series. A series group holds a filled `<path>`, a `<path>` for the top line, and one `<circle>` for each point.

## Stacked

Give `stacked` to put the series one on the other. The first series is on the top, and each area is on the area of the next series. Thus the order from the top to the bottom is the order of the legend, and `ArrowDown` goes down on the screen. The y scale includes the top of the stack.

<Demo source={stackedSource}><Stacked /></Demo>

Without `stacked`, each area starts at zero, and the areas can cover each other. Give the fill an opacity, so that the user can see all of the series.

A stack changes the domain of the y scale. On the server, a guide before the mark does not see the top of the stack. Thus put the mark before the guides, or give the `domain` of the y scale.

## Points

The default radius `r` is 0. The points are hidden, but they stay focus targets. The focused point gets the radius `focusRadius`, which is 4 pixels by default. Give `r` to show all of the points.

## Styles

Give each series a color with the CSS `color`. The filled path uses it as its fill, and the top line uses it as its stroke.

```css
.chart [data-area] {
	opacity: 0.2;
}

.chart [data-line] {
	stroke-width: 2;
}
```

| Element           | Attribute            | When                                                           |
| ----------------- | -------------------- | -------------------------------------------------------------- |
| Group of the mark | `data-mark`          | Always. The value is `area`.                                   |
| Group of the mark | `data-stacked`       | `stacked` is `true`.                                           |
| Group of a series | `data-series`        | The series has a name. The value is the name.                  |
| Filled path       | `data-area`          | Always.                                                        |
| Top line          | `data-line`          | Always.                                                        |
| Point             | `data-point`         | Always.                                                        |
| Point             | `data-focused`       | The point has the focus.                                       |
| Point             | `data-focus-visible` | The point has the focus, and the focus came from the keyboard. |
| Point             | `data-selected`      | The point is selected.                                         |

## API reference

<ApiReference api={api} />
