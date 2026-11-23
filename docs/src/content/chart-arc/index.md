---
title: Chart.Arc
description: Chart.Arc draws one slice of a circle per row — an accessible Svelte pie or donut chart with the share of each slice in its name, a clockwise keyboard order and a share column in the data table.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# Arc

`Chart.Arc` draws one slice of a circle for each row. The angle of a slice shows the share of its value in the total. A pie chart is a chart with an arc mark. A donut chart is the same mark with a hole. Give `inner`, the radius of the hole as a fraction of the radius of the circle.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleBand } from '@human-kit/ui/chart/scales/band';
</script>

<Chart.Root data={sources} x="source" y="energy" yLabel="Energy (GWh)" xScale={{ type: scaleBand }}>
	<Chart.Title>Energy by source</Chart.Title>
	<Chart.Plot>
		<Chart.Arc inner={0.6} />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
```

The x channel gives the category of a slice, and the y channel gives its value. The categories are names, thus the x scale is a band scale, as on a bar chart. The mark makes a `<g>` with one group for the series. The group holds one `<path>` for each slice.

## Order

The first slice starts at the top, and the slices go in the clockwise direction, in the order of the rows. The mark does not sort the rows. Sort them from the largest value to the smallest: then a user can compare the slices one after the other.

The circle is in the middle of the plot, and it fills the smaller side of the plot.

## Values

- A value of 0 makes a slice with no angle. It is still a point: the keyboard gets to it, and its name gives the share "0%".
- A negative value, or a value that is not a number, makes no slice. In a development build, the mark writes a warning for a negative value.
- When the total is 0, the names and the data table do not show a share.

The mark draws one series. Give it the rows of one series only.

## Names

The name of a slice gives the category, the value and the share: "Solar, Energy (GWh) 412, 37.9%". The share has one decimal at most, in the locale of the chart. Thus the shares of a chart can have a sum that is not exactly 100%.

## Labels

Give `labels` to show the value of each slice in the middle of the slice. A function of the point gives other text. A label that is wider than its slice does not show. The labels are for the eye only: the name of each slice already has the value.

## Legend

`Chart.Legend` lists the categories of an arc mark in the order of the slices. Each item gets `data-category`, as each slice does. Thus one CSS rule gives a color to a slice and to its legend item.

## Keyboard

`ArrowRight` and `ArrowDown` move to the next slice, in the clockwise direction. `ArrowLeft` and `ArrowUp` move to the previous slice. `Home` and `End` move to the first and the last slice. The keys do not wrap. The full table is on the [Accessibility](/docs/chart-accessibility) page.

## Styles

Give each slice a color with the CSS `color`. The slices use it as their fill. A stroke in the color of the background keeps the slices apart. In the forced colors mode, all of the slices get one color, thus the stroke is necessary.

```css
.chart [data-category='Solar'] {
	color: #2563eb;
}

.chart [data-mark='arc'] [data-point] {
	stroke: Canvas;
	stroke-width: 1;
}

.chart [data-mark='arc'] [data-point][data-focus-visible] {
	stroke: CanvasText;
	stroke-width: 2;
}

.chart [data-arc-label] {
	fill: white;
}
```

| Element           | Attribute            | When                                                           |
| ----------------- | -------------------- | -------------------------------------------------------------- |
| Group of the mark | `data-mark`          | Always. The value is `arc`.                                    |
| Group of a series | `data-series`        | The series has a name. The value is the name.                  |
| Slice             | `data-point`         | Always.                                                        |
| Slice, label      | `data-category`      | Always. The value is the category.                             |
| Slice             | `data-focused`       | The slice has the focus.                                       |
| Slice             | `data-focus-visible` | The slice has the focus, and the focus came from the keyboard. |
| Slice             | `data-selected`      | The slice is selected.                                         |
| Group of labels   | `data-arc-labels`    | `labels` is set.                                               |
| Label             | `data-arc-label`     | `labels` is set.                                               |

## API reference

<ApiReference api={api} />
