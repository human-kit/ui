# RFC 0002: The dot mark (scatter plots)

- **Status:** Accepted
- **Date:** 2026-10-15
- **Scope:** version 0.2
- **Depends on:** [RFC 0001](0001-architecture.md)

## Summary

`Chart.Dot` is a new mark. It makes one dot per row, at the x value and the y
value of the row. A scatter plot is a `Chart.Root` with a `Chart.Dot` in it.
A dot mark can also go on a line chart or a bar chart, for example to show
targets or outliers.

The parts of version 1 assume that the x values of a series come in order, as
on a time axis. A scatter plot breaks that assumption. The x values are in no
order, two dots can have the same x value, and the two axes are both measures.
Thus this RFC also changes the keyboard order, the names of the points, the
data table and the legend.

## Goals

- A keyboard user and a screen reader user can get to each dot, in an order
  that they can predict.
- The name of a dot tells which value is on which axis.
- A series is not identified by color alone. Dots of two series are mixed on
  the plot, thus each series also gets its own shape.
- The data table shows each dot, also two dots with the same x value.
- A chart that does not import `Chart.Dot` does not get larger, except for
  the changes in the root that this RFC lists.

## Non-goals

- A size channel (bubble charts). The radius is one number for the mark. A
  size channel needs a size scale and a size legend, and it comes in a later
  RFC.
- Aggregation, jitter and the merge of dots that are on top of each other. The
  application prepares the data, as in RFC 0001.
- A Canvas renderer for a large number of dots. Each dot is an element with a
  focus target. The prototype measures the limit (see "Prototype plan").
- A trend line or a regression. An application can calculate one and show it
  with `Chart.Line` and its own `data`.

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';

	type Car = { weight: number; mpg: number; origin: string };
	let { cars }: { cars: Car[] } = $props();
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
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Dot />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
```

## API

### `Chart.Dot`

| Prop                       | Description                                                                                    |
| -------------------------- | ---------------------------------------------------------------------------------------------- |
| `data`, `x`, `y`, `series` | The same as on the other marks: own channels only with own `data` (RFC 0001, open question 2). |
| `name`                     | The name of the series when the mark has one series.                                           |
| `r`                        | The radius of a dot in pixels. The default is 4.                                               |
| `symbol`                   | `auto`, the name of one shape, or `circle` for all series. The default is `auto`.              |
| `class`                    | The class of the `<g>` element of the mark.                                                    |

Each dot is an SVG element with the attributes of a point: `role="img"`, a
roving `tabindex`, `aria-label`, `data-focused`, `data-focus-visible` and
`data-selected`. Each series is a `<g role="group">` with the name of the
series, as in `Chart.Line`. The mark draws with `currentColor` and sets
`data-series` and `data-symbol`, thus a stylesheet can give each series a
color.

### Shapes

With `symbol="auto"`, the series get the shapes in this order: `circle`,
`square`, `triangle`, `diamond`, `cross` and `triangle-down`. After six series, the
order starts again. The shapes have the same area, thus no series looks
larger than the others.

`Chart.Legend` shows the shape of each series in its swatch. Each item of the
legend gets the `data-symbol` attribute, and the default swatch is a small SVG
with the shape. The legend is still hidden from the accessibility tree: the
names of the points give the series.

### Labels of the channels

`Chart.Root` gets two new props:

| Prop     | Description                                                                |
| -------- | -------------------------------------------------------------------------- |
| `xLabel` | The name of the x channel for a user, for example "Weight (lb)". Optional. |
| `yLabel` | The name of the y channel for a user. Optional.                            |

When a label is present:

- The name of a point puts the label before the value of its channel. A dot is
  "Europe, Weight (lb) 2,130, Fuel economy (mpg) 31".
- `Chart.Axis` shows the label of its channel when it has no `label` prop.
- `Chart.DataTable` uses the label as the header of the column.

Without a label, a name has no field, as RFC 0001 decided (open question 6).
The labels are on the root and not on the axes. The reason is that the server
makes the names before it makes an axis that comes after the mark.

The labels change the names of all marks, not only the dot mark. A line chart
without labels keeps its names.

## Accessibility

### Keyboard order

`Chart.Dot` sorts the dots of each series by x value, then by y value. The
order of the elements in the DOM is the same order. Thus a screen reader in
browse mode, the keyboard and the data table give the dots in one order. The
`index` of a `ChartPoint` stays the index of the row in the data.

The keys of RFC 0001 do not change:

| Key                       | Action                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `ArrowRight`, `ArrowLeft` | Moves to the next or the previous dot of the series, in the order of x.                                    |
| `ArrowUp`, `ArrowDown`    | Moves to the previous or the next series, in the order of the legend, to the dot with the closest x value. |
| `Home`, `End`             | Moves to the first or the last dot of the series.                                                          |
| `PageUp`, `PageDown`      | Moves ten dots in the series.                                                                              |

When two dots of the next series have the same distance in x, `ArrowDown`
goes to the dot with the closest y value. This rule also applies to the other
marks, which do not have this case now.

The arrow keys do not move to the dot that is nearest on the screen in the
direction of the arrow. That model is easy for a pointer user, but it is not
easy to predict without the picture. It can also skip a dot: some dots are
never the nearest dot in any direction. See open question 2.

### Dots on top of each other

Two dots with the same position are two points. Each point has its own focus
target and its own name. The pointer gets the first one in the keyboard order.
The keyboard gets to all of them.

### Data table

A mark tells the data table how to show its points:

- `pivot`: one row per x value and one column per series. This is the table
  of version 1, and the line, area and bar marks keep it.
- `list`: one row per point, with the columns series, x and y. The dot mark
  uses it. The series column is not there when the chart has one series.

The table uses the layout of the first mark, as it uses the orientation of the
first mark now. In a `list` table, the cells have no `scope="row"` header,
because no column identifies a row. The selected point gives `aria-current` to
its row.

The pivot table of version 1 keeps one point per x value and series. A second
dot with the same x value replaces the first one. The `list` layout removes
this loss for the dot mark.

### Other requirements

- In `forced-colors` mode, the dots use system colors. The shapes keep the
  series apart.
- The focus ring of a dot follows its shape.
- The tooltip opens on the dot under the pointer, within 40 pixels, as for a
  line. It shows the labels of the channels when they are present.

## Changes to the existing parts

| Part              | Change                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| `Chart.Root`      | `xLabel` and `yLabel`. The names of the points use them.                  |
| `Chart.Axis`      | Shows the label of its channel when it has no `label` prop.               |
| `Chart.Legend`    | Shows the shape of a series that has one.                                 |
| `Chart.DataTable` | The `list` layout. The column headers use the labels.                     |
| `ChartMark`       | Optional `list` and `symbol(series)`.                                     |
| Navigation        | The y value breaks a tie of the x distance for `ArrowUp` and `ArrowDown`. |

## Size

A chart that does not use `Chart.Dot` gets only the root and table changes.
The prototype measures them, and the pull request gives the numbers. Each
change must be smaller than 0.2 kB gzip, or this RFC changes.

A new fixture, "a scatter plot with two axes, a grid and a legend", goes into
`pnpm size`.

## Tests

- Unit tests for the sort of the dots and for the tie rule of `ArrowDown`.
- Unit tests for the paths of the six shapes: the same area for each shape.
- Browser tests for the keyboard table. The cases are dots in no order, dots
  with the same x value and dots on top of each other.
- A server test: the same markup on the server and on the client, with the
  labels and the shapes.
- An accessibility tree test: names with labels, roles, and the hidden legend.
- A data table test: two dots with the same x value make two rows.
- A manual test with NVDA and Chrome before the minor version, with real key
  presses, as in RFC 0001.

## Prototype plan

1. `Chart.Dot` with circles only, the sort, and the keyboard.
2. The labels on the root, and the names.
3. The `list` layout of the data table.
4. The shapes, and the shapes in the legend.
5. Measure the size of each step.
6. Measure the time to draw and to move the focus with 500, 2,000 and 5,000
   dots. Write the limit in the documentation.
7. The NVDA test.

## Prototype results

All of the steps are complete (2026-10-16).

- `Chart.Dot`, the labels, the `list` table and the six shapes are in
  `packages/charts`. A mark sets `list: true` to get the `list` table and the
  names that start with the series. Its `symbol(series)` gives the legend the
  name of the shape and its path. Thus, a legend without dots does not include
  the code of the shapes.
- The sixth shape is `triangle-down` and not `wye`. It needs no new code: it
  is the triangle upside down.
- Sizes from `pnpm size`, gzip, without the Svelte runtime:

  | Chart                                                     | Before   | After    |
  | --------------------------------------------------------- | -------- | -------- |
  | A line with the keyboard operation                        | 5.44 kB  | 5.54 kB  |
  | Stacked bars on a band scale, axes and grid               | 7.34 kB  | 7.45 kB  |
  | A line on a time scale, two axes and a grid               | 7.62 kB  | 7.73 kB  |
  | Stacked areas, axes, grid, legend, tooltip and data table | 10.20 kB | 10.62 kB |
  | A scatter plot with two axes, a grid and a legend         | —        | 7.59 kB  |

  Each change to an existing part is smaller than 0.2 kB. The root and the
  axis add 0.10 kB, the legend 0.14 kB, the data table 0.13 kB and the
  tooltip 0.03 kB. A chart with all of them adds 0.42 kB.

- Time in Chrome, on the test computer:

  | Dots  | Draw   | One key press | One pointer move |
  | ----- | ------ | ------------- | ---------------- |
  | 500   | 184 ms | 6 ms          | 0.4 ms           |
  | 2,000 | 384 ms | 20 ms         | 0.9 ms           |
  | 5,000 | 904 ms | 44 ms         | 1.8 ms           |

  A key press updates the attributes of each dot, because each dot reads the
  focus state. The documentation gives 2,000 dots as the limit.

### Screen reader test

The test used NVDA 2026.2 with Chrome on Windows, with real key presses on
the demo of the docs page: `Tab` into the chart, then `ArrowRight`,
`ArrowRight`, `ArrowDown`, `ArrowUp`, `End`, `ArrowDown` and `Enter`. Each
key moved the focus to the expected dot, and NVDA read:

| Key          | NVDA reads                                                                                                            |
| ------------ | --------------------------------------------------------------------------------------------------------------------- |
| `Tab`        | "Weight and fuel economy of cars, chart, Europe, grouping, Europe, Weight (lb) 2,050, Fuel economy (mpg) 36, graphic" |
| `ArrowRight` | "Europe, Weight (lb) 2,130, Fuel economy (mpg) 31, graphic"                                                           |
| `ArrowRight` | "Europe, Weight (lb) 2,234, Fuel economy (mpg) 30, graphic"                                                           |
| `ArrowDown`  | "Japan, grouping, Japan, Weight (lb) 2,290, Fuel economy (mpg) 32, graphic"                                           |
| `ArrowUp`    | "Europe, grouping, Europe, Weight (lb) 2,234, Fuel economy (mpg) 30, graphic"                                         |
| `End`        | "Europe, Weight (lb) 3,190, Fuel economy (mpg) 22, graphic"                                                           |
| `ArrowDown`  | "Japan, grouping, Japan, Weight (lb) 2,720, Fuel economy (mpg) 25, graphic"                                           |
| `Enter`      | "current"                                                                                                             |

In browse mode, NVDA reads the data table as "table with 26 rows and 3
columns". The headers are "origin", "Weight (lb)" and "Fuel economy (mpg)".

## Open questions

1. **The name of the part.** Decided: `Chart.Dot`. The marks have the name of
   their shape: line, area, bar. `Chart.Point` is a candidate, but "point"
   already means a focus target in RFC 0001 and in `ChartPoint`.
   `Chart.Scatter` is the name of a chart type, and a chart is a composition
   of marks.
2. **The model of the arrow keys.** Decided: the model of RFC 0001, with the
   dots in the order of x. The candidate is a spatial model: an arrow moves to
   the nearest dot on the screen in its direction. The spatial model can skip
   dots, and a user who cannot see the chart cannot predict it.
3. **Shapes by default.** Decided: `symbol="auto"`, thus a chart with two
   series has two shapes without a choice by the developer. The candidate is
   circles by default and shapes on request, which is smaller. A chart that
   identifies a series only by color does not obey RFC 0001.
4. **The place of the labels.** Decided: `xLabel` and `yLabel` on the root.
   The candidate is the `label` of `Chart.Axis`. A chart can have no axis, two
   axes for one channel, or an axis after the mark. The server makes the
   names before it sees that axis.
5. **The order of a name.** Decided: the series first, then x, then y:
   "Europe, Weight (lb) 2,130, Fuel economy (mpg) 31". A line keeps "2015,
   South, 66", because its x value is a category or a date that tells the
   position. On a dot, the series tells the group, and the two values are
   both measures.
