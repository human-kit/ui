---
title: Chart
description: Chart.Root, Chart.Title and Chart.Plot — the data, the typed channels, the scales, the formats, the size and the selection of an accessible Svelte chart.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import ScaleOptions from './demos/scale-options.svelte';
	import scaleOptionsSource from './demos/scale-options.svelte?highlight';
	import Formats from './demos/formats.svelte';
	import formatsSource from './demos/formats.svelte?highlight';
	import api from './api.json';
</script>

# Chart

`Chart.Root` holds the data and the scales of a chart. It controls the focus and the selection of the points. `Chart.Title` names the chart, and `Chart.Plot` makes the SVG that holds the marks and the guides.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/ui';
</script>

<Chart.Root data={rows} x="month" y="visits" series="site">
	<Chart.Title>Visits per month</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
```

`Chart.Root` makes a `<figure>`. `Chart.Title` makes its `<figcaption>`. `Chart.Plot` makes the `<svg>`. The marks and the guides go in the plot. The legend, the tooltip and the data table are HTML, thus they go next to the plot.

## Data and channels

Give the rows in `data`. A mark uses them when it has no `data` of its own.

`x`, `y`, `series` and `key` are channels. A channel is the name of a field of the row, or a function of the row and its index. The field names are typed: `x="month"` is a type error when the row has no `month` field.

A value of a channel is a number, a `Date`, or a string. A string is a category of a band scale.

A row has no point when its x value or its y value is not a number, a date or a string. For example, `undefined` and `NaN` give no point. Such a row takes no focus, and its cell in the data table is empty.

## Series

The `series` channel divides the rows into series. Each series has a name, a group in the SVG and a column in the data table. The order of the series is the order of their first row in the data. Without `series`, the chart has one series without a name.

## Scales

`xScale` and `yScale` set the scale of each axis. Each one is an object with these fields:

- `type` is the scale function: `scaleLinear` (the default), `scaleTime` or `scaleBand`. Import it from its subpath. See [Scales](/docs/chart-scales).
- `domain` gives the values at the two ends. Without it, the root uses the smallest and the largest value.
- `zero` extends the domain to include zero.
- `nice` extends the domain to round values, thus the first and the last tick are at the ends.
- `padding` is the space between two bands of a band scale, as a fraction of a step. The default is 0.2.

The y scale includes zero by default, because a bar starts at zero. Give `yScale={{ zero: false }}` for a line that must fill the plot. When the categories are on the y axis, the x scale includes zero by default. The default of `nice` is the same as the default of `zero`. `zero` does not change a `domain` that you give, but `nice` does. Give `nice: false` to keep the exact domain.

<Demo source={scaleOptionsSource}><ScaleOptions /></Demo>

## Formats

`xFormat` and `yFormat` set the format of the values of each channel. The format applies to the names of the points, the ticks, the tooltip and the data table. A format is one of these:

- The options of `Intl.NumberFormat`, for a linear scale.
- The options of `Intl.DateTimeFormat`, for a time scale.
- A function that receives the value and returns the text. A time scale gives the function a `Date`, and a band scale gives the category.

`locale` sets the locale of all of the values. The default is the locale of the page.

Without a format, a tick label of a time scale shows only the largest calendar field that changes at the tick: "2025", "Mar", "Mar 5" or "9:00 AM". The name of a point shows the date in full, as precise as the data.

<Demo source={formatsSource}><Formats /></Demo>

## Size and margin

- `height` is the height of the SVG in pixels. The default is 300.
- `width` is the width of the SVG in pixels. Without it, the chart follows the width of its container.
- `margin` is the space around the plot, in pixels. Without it, each axis measures its labels, and the root makes the margin of each side large enough for them.

You can give `margin` for some sides only, for example `margin={{ left: 48 }}`.

## Focus and selection

- `bind:focused` holds the point that has the focus, or `null`. The root writes it. It does not read it.
- `bind:selected` holds the selected point, or `null`. `Enter`, `Space` or a click selects a point, and a second time clears the selection. A click or a tap less than 40 pixels from a point also selects it.
- `onSelect` receives the point that the user activated.

A point is a `ChartPoint`. It has the row (`datum`), the index of the row in the data of its mark, and the key of the row. It also has the name of the series, and the x and y values. The row has the type of your data.

The selection follows the key and the series of the point, not the identity of the row. Thus a `selected` value that you hold in a `$state` stays correct, although the state holds a proxy of the row.

## Keys

The `key` channel identifies a row in its series when the data changes. Give a value that is unique in each series, for example a date or an id. A date is its time.

```svelte
<Chart.Root data={rows} x="month" y="visits" series="site" key="month">
```

With a key, the focus and the selection stay on the same row when you add, remove or sort rows. When the focused row is not in the new data, the focus goes to the point at the same place in the series. When there is no point at that place, the focus goes to the first point of the chart.

Without `key`, the key is the row index. Then the focus and the selection stay at the same index, and they can go to a different row.

When two rows of a series have the same key, the series uses the row index as the key. A development build writes a warning.

A mark with its own `data` can have its own `key`, as it can have its own `x` and `y`.

## Accessible name

The chart needs an accessible name. Give it with one of these:

- A `Chart.Title`. The plot gets `aria-labelledby` with the id of the title.
- `aria-label` on `Chart.Root`. It replaces the title as the name.
- `aria-labelledby` on `Chart.Root`, with the id of an element of your page.

Give `aria-describedby` with the id of an element that describes the chart, for example a summary of the trend.

## Rendering on the server

The root makes the SVG on the server with `width`, or with a width of 640 pixels. Without `width`, the SVG fills its container and the browser scales the chart until the first measure. Thus the chart does not make a narrow page wider. After the mount, the root measures the container and draws the chart at the real width. The height does not change.

- The scales on the server come from the `data` and the channels of the root. A chart with only root data has the correct scales in all orders of the parts.
- A mark with its own data or channels, and a stacked mark, add values when they start. On the server, the parts before them do not see these values. Give the `domain`, or put the mark before the guides.
- The margins on the server are the minimum margins, until the axes measure their labels in the browser. Give `width` and `margin`, and the chart does not move after the mount.
- Give a stable `id` to the root when the server makes the page. The ids of the parts come from it.

## Styles

The parts set these attributes for your styles:

| Part         | Attribute            | When                                    |
| ------------ | -------------------- | --------------------------------------- |
| `Chart.Root` | `data-chart`         | Always.                                 |
| `Chart.Root` | `data-focus-within`  | A point of the chart has the focus.     |
| `Chart.Root` | `data-focus-visible` | The focused point shows the focus ring. |
| `Chart.Plot` | `data-plot`          | Always.                                 |

The attributes of the points are on the page of each mark.

## API reference

<ApiReference api={api} />
