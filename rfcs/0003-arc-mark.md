# RFC 0003: The arc mark (pie and donut charts)

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** version 0.5
- **Depends on:** [RFC 0001](0001-architecture.md), [RFC 0002](0002-dot-mark.md)

## Summary

`Chart.Arc` is a new mark. It makes one slice of a circle per row. The angle
of a slice shows the share of its value in the total. A pie chart is a
`Chart.Root` with a `Chart.Arc` in it. A donut chart is the same mark with a
hole in the middle.

The marks of RFC 0001 and RFC 0002 put each value on an axis. An arc has no
axis: the position of a slice on the circle shows its order, and its angle
shows its share. Thus this RFC also changes the names of the points, the data
table, the legend and the pointer test of the root.

## Goals

- A keyboard user and a screen reader user can get to each slice, in the
  order of the slices on the screen.
- The name of a slice gives its category, its value and its share of the
  total.
- A slice is not identified by color alone. The legend lists the categories
  in the order of the slices.
- The data table shows the value and the share of each slice.
- A chart that does not import `Chart.Arc` does not get larger, except for
  the changes in the root that this RFC lists.

## Non-goals

- More than one series. A mark with a series channel draws only the first
  series in this version. Rings (one ring per series) come in a later RFC.
- The merge of small slices into one slice, for example "Other". The
  application prepares the data, as in RFC 0001.
- Labels out of the circle with lines to the slices. They need a layout
  that moves the labels apart, and that costs bytes.
- A part of a circle, for example a gauge with half a circle.
- A slice that moves out of the circle when it has the focus.
- Text in the hole of a donut. An application can put an element on top of
  the hole.

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleBand } from '@human-kit/charts/scales/band';

	type Region = { region: string; sales: number };
	let { regions }: { regions: Region[] } = $props();
</script>

<Chart.Root data={regions} x="region" y="sales" yLabel="Sales" xScale={{ type: scaleBand }}>
	<Chart.Title>Sales by region</Chart.Title>
	<Chart.Plot>
		<Chart.Arc inner={0.6} />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
```

## API

### `Chart.Arc`

| Prop                       | Description                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `data`, `x`, `y`, `series` | The same as on the other marks. `x` gives the category of a slice, and `y` gives its value.       |
| `name`                     | The name of the series.                                                                           |
| `inner`                    | The radius of the hole, as a fraction of the radius of the circle. The default is 0, a pie chart. |
| `labels`                   | `true` shows the value of each slice in the slice. A function of the point gives other text.      |
| `class`                    | The class of the `<g>` element of the mark.                                                       |

The x channel and the y channel are the channels of the root. A slice is a
bar in polar coordinates: the category is the band, and the value is the
length. Thus the names, the tooltip, the data table and the types of the
channels do not need a second path. The x scale is not used to draw, but it
keeps the categories in the order of the data, as on a bar chart.

The circle is in the middle of the plot. Its radius is half of the smaller
side of the plot. The first slice starts at the top, and the slices go in the
clockwise direction, in the order of the data. The mark does not sort the
data: the documentation tells the application to sort the rows from the
largest value to the smallest.

Each slice is a `<path>` with the attributes of a point: `role="img"`, a
roving `tabindex`, `aria-label`, `data-focused`, `data-focus-visible` and
`data-selected`. Each slice also gets `data-category` with its category, thus
a stylesheet can give each slice a color. The series is a
`<g role="group">`, as on the other marks.

### Values

- A value of 0 makes a slice with no angle. It is still a point: the keyboard
  gets to it, and its name gives the share "0%".
- A negative value, or a value that is not a finite number, makes no slice
  and no point, as a gap on a line. In a development build, the mark writes a
  warning for a negative value.
- When the total is 0, the names and the data table do not show a share.

### Labels

With `labels`, the mark puts the text of each slice in the middle of the
slice. The labels are for the eye only, as on a bar. They are in a group with
`aria-hidden="true"`, because the names of the slices already give the
values. A label that is wider than its slice does not show.

### Legend

`Chart.Legend` lists the categories of an arc mark, not its series. The items
are in the order of the slices, and each item gets `data-category`. Thus the
same CSS rule gives a color to a slice and to its legend item. The legend
stays hidden from the accessibility tree.

## Accessibility

### Names

The name of a slice gives the category, the value and the share:
"Europe, 1,200, 34%". With a `yLabel`, it is "Europe, Sales 1,200, 34%".
The order is the order of RFC 0001 for a category on x: the category tells
the position, then the value. The share is last, because it comes from the
value.

The share uses `Intl.NumberFormat` with `style: 'percent'`, in the locale of
the chart, with one decimal at most. Thus the shares of a chart can have a
sum that is not exactly 100%.

### Keyboard

The keys of RFC 0001 apply, with the slices in the clockwise order:

| Key                       | Action                                               |
| ------------------------- | ---------------------------------------------------- |
| `ArrowRight`, `ArrowDown` | Moves to the next slice, in the clockwise direction. |
| `ArrowLeft`, `ArrowUp`    | Moves to the previous slice.                         |
| `Home`, `End`             | Moves to the first or the last slice.                |
| `PageUp`, `PageDown`      | Moves ten slices.                                    |
| `Enter`, `Space`          | Selects the slice and calls `onSelect`.              |

The keys do not wrap, as on the other marks. The first slice is at the top,
thus `Home` gives a fixed point to start again.

An arc mark has one series, thus the vertical arrows have no series to move
to. They move in the series, as the horizontal arrows do. A user who presses
`ArrowDown` gets the next slice and not silence. A chart with an arc mark and
a mark with axes is not a use case of this RFC.

### Pointer

The tooltip opens on the slice under the pointer. The arc mark gives the
root a `distance` that is 0 in the slice and large out of it. Thus, a pointer
in the hole or out of the circle opens no tooltip. The tooltip points to the
middle of the slice.

### Data table

The data table of an arc mark has one row per slice and three columns: the
category, the value and the share. The header of the share column is "%",
because a word needs a translation and the library has no texts of its own.
The row of the selected slice gets `aria-current`, as in the `list` layout of
RFC 0002.

### Other requirements

- In `forced-colors` mode, all of the slices get the same system color. Each
  slice then gets a stroke in the color of the background, thus the slices
  stay apart. The legend and the names give the categories.
- The focus ring of a slice is a stroke that follows its shape.
- A slice with no angle has no focus ring on the screen. The tooltip shows
  its value when it has the focus.

## Changes to the existing parts

| Part              | Change                                                                       |
| ----------------- | ---------------------------------------------------------------------------- |
| `ChartMark`       | Optional `share`. The names add the share, and the data table adds a column. |
| `Chart.Root`      | The names of the points of a `share` mark, and `locale` in the context.      |
| `Chart.Legend`    | Lists the x values of a `share` mark, with `data-category`.                  |
| `Chart.DataTable` | The share column.                                                            |
| Navigation        | The vertical arrows move in the series of a `share` mark.                    |

## Size

A chart that does not use `Chart.Arc` gets only the root, legend and table
changes. Each change must be smaller than 0.2 kB gzip, or this RFC changes.

A new fixture, "a donut with a legend and a data table", goes into
`pnpm size`.

## Tests

- Unit tests for the path of a slice: a full circle, a slice with no angle,
  and a slice with a hole.
- Unit tests for the shares: a total of 0, and a negative value.
- Browser tests for the keyboard table, also for the vertical arrows.
- A browser test for the pointer: the hole and the space out of the circle
  open no tooltip.
- A server test: the same markup on the server and on the client.
- An accessibility tree test: names with the share, roles, and the hidden
  legend.
- A data table test: the share column and `aria-current`.
- A manual test with NVDA and Chrome before the minor version, with real key
  presses, as in RFC 0001.

## Prototype plan

1. `Chart.Arc` with no hole, the order of the slices, and the keyboard.
2. The share in the names.
3. The share column of the data table.
4. The categories in the legend.
5. The hole and the labels.
6. Measure the size of each step.
7. The NVDA test.

## Prototype results

All of the steps are complete (2026-10-29).

- `Chart.Arc` is in `packages/charts`. A mark sets `share(point)` to get the
  names with the share, the share column and the categories in the legend.
  `share` gives the text of the share, and not a number. The arc mark makes
  the percent format, thus a chart without an arc mark does not include it.
  For this, the context gives the `locale` of the root.
- The x scale is a band scale, as on a bar chart. The root formats a category
  only with a band scale, thus the warning of the root for categories stays.
- The library sets no color. The stroke between the slices in the
  `forced-colors` mode is in the CSS of the documentation, and the Arc page
  tells the reason for it.
- Sizes from `pnpm size`, gzip, without the Svelte runtime:

  | Chart                                                     | Before   | After    |
  | --------------------------------------------------------- | -------- | -------- |
  | A line with the keyboard operation                        | 5.59 kB  | 5.65 kB  |
  | Stacked bars on a band scale, axes and grid               | 8.56 kB  | 8.61 kB  |
  | A line on a time scale, two axes and a grid               | 7.80 kB  | 7.86 kB  |
  | Stacked areas, axes, grid, legend, tooltip and data table | 11.07 kB | 11.26 kB |
  | A scatter plot with two axes, a grid and a legend         | 7.65 kB  | 7.80 kB  |
  | A donut with a legend and a data table                    | —        | 8.42 kB  |

  Each change to an existing part is smaller than 0.2 kB. The root adds
  0.06 kB, the legend 0.09 kB and the data table 0.04 kB. A chart with all of
  them adds 0.19 kB.

### Screen reader test

The test used NVDA 2026.2 with Chrome on Windows, with real key presses on
the demo of the docs page: `Tab` into the chart, then `ArrowRight`,
`ArrowRight`, `ArrowDown`, `ArrowUp`, `End`, `ArrowDown`, `Home` and `Enter`.
Each key moved the focus to the expected slice, and NVDA read:

| Key          | NVDA reads                                                                             |
| ------------ | -------------------------------------------------------------------------------------- |
| `Tab`        | "Energy of the city by source in 2025, chart, Solar, Energy (GWh) 412, 37.9%, graphic" |
| `ArrowRight` | "Wind, Energy (GWh) 296, 27.2%, graphic"                                               |
| `ArrowRight` | "Hydro, Energy (GWh) 231, 21.3%, graphic"                                              |
| `ArrowDown`  | "Gas, Energy (GWh) 148, 13.6%, graphic"                                                |
| `ArrowUp`    | "Hydro, Energy (GWh) 231, 21.3%, graphic"                                              |
| `End`        | "Gas, Energy (GWh) 148, 13.6%, graphic"                                                |
| `ArrowDown`  | Nothing. The focus stays on the last slice, because the keys do not wrap.              |
| `Home`       | "Solar, Energy (GWh) 412, 37.9%, graphic"                                              |
| `Enter`      | "current"                                                                              |

The series has no name, thus NVDA does not read a group.

## Open questions

1. **The name of the part.** Decided: `Chart.Arc`. A mark has the name of its
   shape, as RFC 0002 decided. A donut is the same shape with a hole, thus it
   is a prop and not a second part. `Chart.Pie` is the name of a chart type.
2. **The channels.** Decided: `x` gives the category and `y` gives the value.
   The candidate is two new props, for example `category` and `value`. They
   are easier to read, but the root, the tooltip and the data table then need
   a second path for the same data.
3. **The text of a name.** Decided: the value and the share,
   "Europe, 1,200, 34%". The share is what a pie chart shows. The candidates
   were the share only and the value only. The share only puts the value only
   in the data table. The value only does not give the share that the eye sees.
4. **What identifies a slice on the screen.** Decided: the legend in the
   order of the slices, and labels in the slices on request. The candidate
   is labels by default. A label does not fit in a small slice, and labels out
   of the circle need a layout that costs bytes.
5. **The vertical arrows.** Decided: they move in the series. In the NVDA
   test, `ArrowDown` and `ArrowUp` moved the focus to the next and the
   previous slice, and NVDA read each slice.
