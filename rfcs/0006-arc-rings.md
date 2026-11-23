# RFC 0006: Rings on the arc mark

- **Status:** Draft
- **Date:** 2026-10-29
- **Scope:** version 0.6 or later
- **Depends on:** [RFC 0001](0001-architecture.md), [RFC 0003](0003-arc-mark.md)

## Summary

RFC 0003 added `Chart.Arc` with one series. A mark with a series channel draws
only its first series, and RFC 0003 put rings in a later RFC. This RFC gives
each series of an arc mark its own ring. The rings have the same center. Each
ring shows the shares of the categories in its series.

The change touches the arc mark, the keyboard of the root, the data table and
the documentation. It adds no new part.

This RFC also asks a question before the design: is a chart with rings worth
its bytes? The section "Demand" gives the case for and against.

## Demand

The case for rings:

- A consumer with data in series, for example sales by region for two years,
  gets the first year only. The other series disappear, and the mark gives no
  warning in a production build.
- The data model of the library already has series. Thus rings use the
  channels, the names and the keyboard of RFC 0001, and do not add a new
  model.
- The cost is small. The geometry of a ring is the geometry of a donut with a
  different radius.

The case against:

- A ring chart is hard to read. The eye compares angles badly across rings.
  A slice of the inner ring is shorter than a slice with the same angle on
  the outer ring.
- A stacked bar chart, with one bar per series, shows the same data. Its parts
  are on one axis, thus the eye compares their lengths.
- No issue in the repository asks for rings at the date of this RFC.

Recommended: keep this RFC as a draft until a consumer asks for rings. Then
build the prototype of this RFC. Until then, the documentation of the arc mark
tells a user with series to use a stacked bar chart. Also, the mark writes a
warning in a development build when it drops a series.

## Goals

- Each series of an arc mark is a ring, and each ring shows all of its
  categories.
- A keyboard user can move along a ring and between the rings.
- The name of a slice gives its category, its series, its value and its share
  of its ring.
- The data table gives the value and the share of each slice of each ring.
- A chart with one series behaves as in version 0.5, with the same keys and
  the same names.
- A chart that does not import `Chart.Arc` does not get larger. The only
  exceptions are the changes in the root and the data table that this RFC
  lists.

## Non-goals

- A hierarchy, where a slice of an outer ring divides a slice of the inner
  ring. That is a different chart, with a different data model.
- Rings with different widths, or a width for each ring.
- A share of the total of all of the rings. Each ring is a whole.
- A label with the name of each ring on the chart. See open question 7.
- Labels out of the circle, and text in the hole, as in RFC 0003.

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleBand } from '@human-kit/charts/scales/band';

	type Sale = { region: string; year: string; sales: number };
	let { sales }: { sales: Sale[] } = $props();
</script>

<Chart.Root
	data={sales}
	x="region"
	y="sales"
	series="year"
	yLabel="Sales"
	xScale={{ type: scaleBand }}
>
	<Chart.Title>Sales by region, 2024 and 2025</Chart.Title>
	<Chart.Plot>
		<Chart.Arc inner={0.4} />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
```

The props do not change. A series channel on the root or on the mark makes
the rings.

## Geometry

### Order of the rings

Recommended: the first series is the outer ring. The rings go to the center
in the order of the series.

The reasons:

- The keyboard starts on the first slice of the first series. That slice is
  at the top of the outer ring, which is the highest point of the chart.
- RFC 0001 puts the first series of a vertical stack on the top, thus
  `ArrowDown` goes down on the screen. At the top of the circle, the next
  ring in, below the outer ring on the screen, has the same relation.
- The outer ring has the longest arcs. The first series is often the most
  important one, for example the current year.

The candidate is the first series in the center. It reads from the inside to
the outside, as the series of a stack read from zero. The focus then starts
on the smallest ring.

### Width and gap

Recommended: the rings divide the space between the hole and the edge of the
circle into equal widths. The mark adds no gap. A stroke in the color of the
background, in the CSS of the application, keeps the rings apart. The
`forced-colors` mode of RFC 0003 keeps the slices apart in the same way.

With `n` rings, an outer radius `r1` and a hole `r0`, ring `k` (from 0, the
outer ring) goes from `r1 - (k + 1) * w` to `r1 - k * w`, where
`w = (r1 - r0) / n`.

The candidates:

- A `gap` prop, in pixels, between the rings. It costs bytes, and a CSS stroke
  gives the same result.
- Rings with equal areas. The angle shows the share, not the area, thus equal
  areas add calculation and give no information.

### The hole

`inner` keeps its meaning: the radius of the hole, as a fraction of the
radius of the circle. With `inner` at 0, the innermost ring is a full pie.

Recommended: keep the default of 0, and tell the user in the documentation to
set a hole for rings. A pie in the middle of rings looks like one more slice
of the outer ring.

The candidate is a default hole when the mark has more than one series. A
default that changes with the data is hard to predict.

### Shares

Recommended, to confirm: each ring is a whole. The shares of a ring have a
sum of 100%, and the first slice of each ring starts at the top. The mark
calculates one total per series. A ring with a total of 0 shows no slices,
and its names have no share, as in RFC 0003.

The candidate is a share of the total of all of the rings. The angle of a
slice then does not show its share in its own series, and the rings do not
close.

## Accessibility

### Names

The root already puts the series in the name of a point, after the category.
Thus a slice of a ring has the name "Europe, 2025, Sales 1,200, 34%". The
series of a mark with one series has no name, thus the names of version 0.5
do not change.

Each ring is a `<g role="group">` with the name of the series, as on the
other marks. The NVDA test of RFC 0001 shows the reading to expect. When the
focus goes to a new ring, NVDA reads the name of the group first:
"2024, grouping, Europe, 2024, Sales 1,050, 31%, graphic".

Recommended: keep the series in the group and in the name. The other marks
do the same, and RFC 0001 tested it with NVDA and JAWS. JAWS reads the group
name after the point, and a user in browse mode reads only the names.

The candidate is the series in the group only. The names are shorter, but a
screen reader that does not read the group then does not give the ring.

### Keyboard

Recommended: with more than one series, the keys follow RFC 0001.

| Key                       | Action                                                    |
| ------------------------- | --------------------------------------------------------- |
| `ArrowRight`, `ArrowLeft` | Moves to the next or the previous slice in the ring.      |
| `ArrowDown`, `ArrowUp`    | Moves to the slice of the same category in the next ring. |
| `Home`, `End`             | Moves to the first or the last slice in the ring.         |
| `PageUp`, `PageDown`      | Moves ten slices in the ring.                             |
| `Enter`, `Space`          | Selects the slice and calls `onSelect`.                   |

`ArrowDown` goes to the next series, thus to the next ring in. The keys do
not wrap.

With one series, the vertical arrows move in the ring, as in version 0.5. RFC
0003 decided this behavior with NVDA: a user who presses `ArrowDown` gets the
next slice and not silence. Thus the meaning of `ArrowDown` changes with the
number of series. The root makes this test on the entries of the mark, and
not on the mark type.

The candidates:

- The vertical arrows always move between the rings. With one series,
  `ArrowDown` then does nothing. This breaks the decision of RFC 0003.
- The vertical arrows always move in the ring, and no key moves between the
  rings. A user must then go to the last slice and press `Tab`, but `Tab`
  leaves the chart.

### The target of a vertical arrow

Recommended: the slice with the same category in the next ring. When that
ring has no slice for the category, the target is the slice with the closest
category index. The `move` function of the root does this today. The place
of a slice is the index of its category, and `ArrowDown` goes to the nearest
place in the next series. Thus this rule adds no code.

The candidates:

- The slice with the same index in the next ring. It is the same as the same
  category when the rings have the same categories in the same order. When a
  value is negative and makes no slice, the indexes move and the target is a
  different category.
- The slice at the same angle in the next ring. It follows the eye, but the
  user gets a different category. The name of the slice must then tell the
  user that the category changed.

### Pointer

Each ring gives the root its own `distance`, from its own radii. The tooltip
opens on the slice under the pointer, and points to the middle of the slice
in its ring. The hole and the space out of the outer ring open no tooltip, as
in RFC 0003.

### Other requirements

- In `forced-colors` mode, the stroke between the slices also separates the
  rings.
- The focus ring of a slice follows its shape in its ring, as in RFC 0003.

## Legend

Recommended: the legend lists the categories only, in the order of the
first ring. A category that is only in a later ring goes after them. The
rings have no color of their own, thus a legend item for a series has no
swatch to show. The names of the slices, the groups and the data table give
the series. The documentation tells the application to say the order of the
rings in the title or in a caption, for example "Outer ring: 2025".

The candidate is a second list in the legend with the series, in the order of
the rings from the outside. Each item gets `data-series`, thus the CSS can
show the position of the ring. It adds bytes to every chart with a legend.

## Data table

Recommended: one row per category, and two columns per series: the value and
the share. The header of a share column is the series name and "%", for
example "2025 %". The library has no texts of its own, thus it puts the name
and the sign together and adds no word.

| Region | 2025  | 2025 % | 2024  | 2024 % |
| ------ | ----- | ------ | ----- | ------ |
| Europe | 1,200 | 34%    | 1,050 | 31%    |
| Asia   | 980   | 28%    | 1,010 | 30%    |

The selection is on the two cells of the selected slice, with
`aria-current`, as on a table of series in RFC 0001. With one series, the
table keeps the layout of RFC 0003, with the selection on the row.

The candidates:

- A share column after all of the value columns. The share is then far from
  its value in a wide table.
- One row per slice, with a column for the series, as the `list` layout of
  RFC 0002. It reuses code, but a user cannot compare one category across the
  rings in one row.

## Labels and tooltip

Labels go in the middle of each slice, in its own ring. The test of RFC 0003
that hides a label wider than its slice uses the width of the ring, thus more
rings show fewer labels. The labels stay `aria-hidden="true"`.

Recommended: no change to the tooltip. It already shows the series. The share
is not in the tooltip of version 0.5, and this RFC does not add it. A later
change can add the share to the tooltip of all arc marks.

## Changes to the existing parts

| Part              | Change                                                                          |
| ----------------- | ------------------------------------------------------------------------------- |
| `Chart.Arc`       | All of the series, a ring per series, a total per series and radii per ring.    |
| `Chart.Root`      | The vertical arrows move in the ring only when the mark has one series.         |
| `Chart.DataTable` | A share column after each value column when a `share` mark has several series.  |
| `Chart.Legend`    | No change, or a list of series if open question 6 takes the candidate.          |
| Documentation     | The Arc page gets a ring demo, the order of the rings and the stacked bar note. |

## Size

A chart that does not use `Chart.Arc` gets only the root and data table
changes. Each change must be smaller than 0.1 kB gzip, or this RFC changes.
The donut fixture of `pnpm size` must grow by less than 0.3 kB gzip.

A new fixture, "two rings with a legend and a data table", goes into
`pnpm size`.

## Tests

- Unit tests for the radii of the rings: one ring, three rings, and a hole.
- Unit tests for the shares: a total for each ring, and a ring with a total
  of 0.
- Browser tests for the keyboard table with two and three rings, also for a
  ring without a category of the ring before it.
- A browser test that a mark with one series keeps the keys of version 0.5.
- A browser test for the pointer: each ring opens the tooltip of its own
  slice, and the hole opens none.
- A server test: the same markup on the server and on the client.
- An accessibility tree test: a group per ring with the series name, and the
  names of the slices.
- A data table test: the share columns and `aria-current` on the cells.
- A manual test with NVDA and Chrome before the minor version, with real key
  presses, as in RFC 0001.

## Prototype plan

1. All of the series in the arc mark, with a ring per series and a total per
   series.
2. The keyboard: the vertical arrows between the rings, and the test for one
   series.
3. The share columns of the data table.
4. The labels in each ring.
5. Measure the size of each step.
6. The NVDA test, with these keys: `Tab`, `ArrowRight`, `ArrowDown`,
   `ArrowLeft`, `ArrowUp`, `End` and `ArrowDown`.

## Open questions

1. **Whether to build rings.** Recommended: keep this RFC as a draft until a
   consumer asks for rings. Add a warning in a development build when the
   mark drops a series. The candidate is to build the prototype now, because
   the cost is small.
2. **The order of the rings.** Recommended: the first series is the outer
   ring. The candidate is the first series in the center.
3. **The width and the gap of the rings.** Recommended: equal widths and no
   gap prop, with a CSS stroke between the rings. The candidates are a `gap`
   prop and rings with equal areas.
4. **The shares.** Recommended: each ring is a whole, with a sum of 100%. The
   candidate is a share of the total of all of the rings.
5. **The vertical arrows.** Recommended: with more than one series, they move
   between the rings, to the slice with the same category. With one series,
   they move in the ring, as in version 0.5. The candidates are the same index,
   the same angle, and one behavior for all charts.
6. **The legend.** Recommended: categories only, with the order of the rings
   in the title or a caption. The candidate is a second list with the series.
7. **The name of a ring on the chart.** Recommended: no label for a ring in
   this version. The candidate is the series name at the top of each ring. It
   collides with the first slice, and it needs a layout.
8. **The data table.** Recommended: one row per category, with a value column
   and a share column for each series. The candidates are all of the share
   columns at the end, and one row per slice.
9. **The names.** Recommended: the series in the group and in the name of
   each slice, as on the other marks. The candidate is the series in the group
   only.
