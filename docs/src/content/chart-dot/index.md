---
title: Chart.Dot
description: Chart.Dot draws one dot per row — an accessible Svelte scatter plot with a shape per series, a predictable keyboard order and a row per dot in the data table.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# Dot

`Chart.Dot` draws one dot for each row, at the x value and the y value of the row. A scatter plot is a chart with a dot mark. A dot mark can also go on a line chart or a bar chart, for example to show targets.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/ui';
</script>

<Chart.Root
	data={cars}
	x="weight"
	y="mpg"
	series="origin"
	xLabel="Weight (lb)"
	yLabel="Fuel economy (mpg)"
	xScale={{ zero: false }}
	yScale={{ zero: false }}
>
	<Chart.Title>Weight and fuel economy</Chart.Title>
	<Chart.Plot>
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Dot />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.DataTable />
</Chart.Root>
```

The mark makes a `<g>` with one group for each series. A series group holds one `<path>` for each dot.

## Labels

On a scatter plot, the two values of a dot are measures. A name such as "Europe, 2,130, 31" does not tell which value is the weight. Give `xLabel` and `yLabel` to `Chart.Root`:

- The name of a dot puts the label before each value: "Europe, Weight (lb) 2,130, Fuel economy (mpg) 31".
- An axis without a `label` shows the label of its channel.
- The tooltip and the data table show the labels.

A name of a dot starts with the series, because the series tells the group, and the two values are both measures. The labels are also available on the other marks.

## Scales

The y scale includes zero by default, because a bar needs it. On a scatter plot, give `zero: false` to the scales, thus the dots fill the plot.

## Shapes

Color must not be the only thing that identifies a series. The dots of two series are mixed on the plot, thus each series also gets its own shape. With `symbol="auto"` (the default), the series get the shapes in this order: `circle`, `square`, `triangle`, `diamond`, `cross` and `triangle-down`. After six series, the order starts again.

All of the shapes have the same area as a circle with the radius `r`. The default radius is 4 pixels. Give a shape name, for example `symbol="circle"`, to give that shape to all of the series.

`Chart.Legend` shows the shape of each series in its swatch.

## Order

The dots of a series are in the order of x, then of y. The keyboard, the order of the elements and the data table use this order. Thus a screen reader user can predict the next dot, and the data does not need an order.

Two dots at the same position are two points. Each one has its own focus target and its own row in the data table.

## Keyboard

`ArrowRight` and `ArrowLeft` move to the next or the previous dot of the series, in the order of x. `ArrowUp` and `ArrowDown` move to the dot with the closest x value in the previous or the next series. When two dots have the same distance in x, the dot with the closest y value gets the focus. The full table is on the [Accessibility](/docs/chart-accessibility) page.

## Number of dots

Each dot is an element and a focus target. With 2,000 dots, the chart draws in about 0.5 seconds, and a key press moves the focus in about 7 milliseconds. With 5,000 dots, the chart draws in about 1.3 seconds, and a key press takes about 15 milliseconds. Above 2,000 dots, think about a summary of the data.

## Styles

Give each series a color with the CSS `color`. The dots use it as their fill.

```css
.chart [data-series='Europe'] {
	color: #2563eb;
}

.chart [data-mark='dot'] [data-point] {
	fill-opacity: 0.8;
}

.chart [data-mark='dot'] [data-point][data-focus-visible] {
	stroke: currentColor;
	stroke-width: 2;
}
```

The focus ring is a stroke on the path, thus it follows the shape.

| Element           | Attribute            | When                                                         |
| ----------------- | -------------------- | ------------------------------------------------------------ |
| Group of the mark | `data-mark`          | Always. The value is `dot`.                                  |
| Group of a series | `data-series`        | The series has a name. The value is the name.                |
| Group of a series | `data-symbol`        | Always. The value is the name of the shape.                  |
| Dot               | `data-point`         | Always.                                                      |
| Dot               | `data-focused`       | The dot has the focus.                                       |
| Dot               | `data-focus-visible` | The dot has the focus, and the focus came from the keyboard. |
| Dot               | `data-selected`      | The dot is selected.                                         |

## API reference

<ApiReference api={api} />
