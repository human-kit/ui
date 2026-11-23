---
title: Chart.Axis and Chart.Grid
description: Chart.Axis draws the ticks and labels of an axis on any side of the plot, and Chart.Grid draws the grid lines — decoration that stays out of the accessibility tree.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# Axis and Grid

`Chart.Axis` draws the ticks, the tick labels and the label of one axis. `Chart.Grid` draws a line across the plot at each tick of one axis. The two parts share the ticks of the root, thus the grid lines and the ticks are at the same values.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<Chart.Plot>
	<Chart.Grid axis="y" />
	<Chart.Axis position="bottom" label="Distance (km)" />
	<Chart.Axis position="left" label="Pace (minutes per km)" />
	<Chart.Line />
</Chart.Plot>
```

Both parts go in `Chart.Plot`. Put the grid before the marks, so that the marks are on top of the grid lines.

## Axis

`position` sets the side of the plot: `top`, `right`, `bottom` or `left`. The default is `bottom`. An axis on the top or the bottom shows the x scale. An axis on the left or the right shows the y scale. You can show one scale on two sides.

`label` is the text of the axis, for example the name and the unit of the values. Without it, the axis shows the `xLabel` or the `yLabel` of `Chart.Root`. `tickSize` is the length of a tick line, and `tickPadding` is the distance between a tick line and its label.

The root makes about one tick for each 80 pixels of a horizontal axis, and one tick for each 40 pixels of a vertical axis. A band scale has a tick for each category. When there is not sufficient space, it shows one category in two, or one in three.

## Margins

Without a `margin` on `Chart.Root`, each axis measures its labels after the mount and asks the root for the space. The margin of a side is the largest space that an axis on that side needs. Before the first measure, for example on the server, the root uses an estimate.

Give `margin` on `Chart.Root` when the chart must not move after the mount.

## Grid

`axis` sets the axis whose ticks give the lines. The default is `y`: horizontal lines at the ticks of the y scale. Give `axis="x"` for vertical lines. Use two grids for both.

## Accessibility

The axes and the grid lines have `aria-hidden="true"`. A screen reader does not read them. The names of the points and the data table give the values, with the same formats as the tick labels.

A screen reader does not read the `label` of an axis. When the unit is important, give `xLabel` and `yLabel` to `Chart.Root`: the names of the points include them, and the axes show them. You can also put the unit in the title, in the format of the values, or in the description of the chart.

## Styles

The axis draws with `currentColor`: its lines use it as the stroke, and its text uses it as the fill. The grid lines use `currentColor` as their stroke. Give each part a `color`:

```css
.chart [data-grid] {
	color: #e5e7eb;
}

.chart [data-axis] {
	color: #6b7280;
	font-size: 12px;
}
```

| Part         | Element             | Attribute         | Value                              |
| ------------ | ------------------- | ----------------- | ---------------------------------- |
| `Chart.Axis` | Group of the axis   | `data-axis`       | The `position`.                    |
| `Chart.Axis` | Line along the plot | `data-axis-line`  | Empty.                             |
| `Chart.Axis` | Group of a tick     | `data-tick`       | Empty. It holds a line and a text. |
| `Chart.Axis` | Text of the label   | `data-axis-label` | Empty.                             |
| `Chart.Grid` | Group of the lines  | `data-grid`       | The `axis`.                        |

## API reference

<ApiReference api={api} />
