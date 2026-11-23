# RFC 0001: Architecture of `@human-kit/charts`

- **Status:** Accepted
- **Date:** 2026-10-09
- **Scope:** version 1

## Summary

`@human-kit/charts` is a set of headless chart components for Svelte 5. A chart
is a composition of parts in one namespace. The root holds the data and the
scales. Each mark draws one layer of the chart from the data. The library gives
the behavior: the scales, the geometry, the keyboard operation, the focus
control and the accessible names. You write all of the CSS.

The library has two primary requirements, in this order:

1. Accessibility. A keyboard user and a screen reader user get the same data as
   a pointer user.
2. Size. The library has no runtime dependency, and each part has a subpath
   export. The goal is the smallest size possible.

## Goals

- A chart is a composition of marks, not a chart type with options. Two marks
  can share the scales, and each mark can have its own data.
- The field names of the data are typed. An incorrect field name is a type
  error.
- Each chart has one tab stop. The arrow keys move the focus over the data.
- Each chart can show its data as a table.
- The chart follows the size of its container.
- The library is correct on a server. It makes a static SVG without a browser.
- The public API follows the conventions of `@human-kit/ui`: namespaces, parts,
  `bind:` on each stateful prop, `controlled*` props, and `data-*` attributes.

## Non-goals for version 1

- A Canvas renderer.
- Animation. A transition is a later addition, and it will obey
  `prefers-reduced-motion`.
- Brush, zoom and pan.
- Data fetch, data cleanup and aggregation. The application prepares the data.
  The library includes only the stack transform that the bar and area marks
  need.
- Pie, donut, scatter and other chart forms. They come after version 1.

## Scope of version 1

| Group  | Parts                                                       |
| ------ | ----------------------------------------------------------- |
| Root   | `Chart.Root`, `Chart.Title`, `Chart.Plot`                   |
| Marks  | `Chart.Line`, `Chart.Area`, `Chart.Bar`                     |
| Guides | `Chart.Axis`, `Chart.Grid`, `Chart.Legend`                  |
| Access | `Chart.Tooltip`, `Chart.DataTable`                          |
| Scales | `linear`, `band`, `time` (pure functions, one subpath each) |

## Principles

### Headless

- A part makes plain SVG or HTML elements. It sets no color, no font and no
  size.
- A part shows its state in `data-*` attributes, for example `data-series`,
  `data-focused` and `data-focus-visible`.
- A mark draws with `currentColor` and CSS custom properties. Thus a chart
  without CSS is visible, and a theme is a stylesheet.
- An optional stylesheet, `@human-kit/charts/theme.css`, gives a default
  theme. The components do not import it.

### Size

- No runtime dependency. The scales, the tick algorithm, the path generators
  and the stack transform are in this package.
- One subpath export per part and per scale. A bundler includes only the parts
  that you import.
- `"sideEffects": false` in `package.json`.
- `pnpm size` measures the gzip size of a set of fixed charts. CI runs it on
  each pull request and writes the result in the pull request. An increase
  needs a reason in the pull request body.
- An implementation decision that adds bytes must give an accessibility or
  correctness reason. A shorter API is not a reason.

### Typed data

- `Chart.Root` is generic over the row type `T`.
- A channel is a field name of `T` or a function of the row:
  `y="revenue"` or `y={(row) => row.revenue / 1000}`.
- `onSelect` and the focus state give the original row, with the type `T`.

## Anatomy

`Chart.Root` makes a `<figure>`. `Chart.Plot` makes the `<svg>` in it. The
marks and the guides go in `Chart.Plot`. The HTML parts (title, legend,
tooltip, data table) go next to it, because HTML cannot be in an SVG.

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';

	type Sale = { month: Date; revenue: number; region: string };
	let { sales }: { sales: Sale[] } = $props();
</script>

<Chart.Root data={sales} x="month" y="revenue" series="region">
	<Chart.Title>Revenue per month</Chart.Title>
	<Chart.Plot>
		<Chart.Grid axis="y" />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" label="Revenue (USD)" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
```

## API

### `Chart.Root`

| Prop                            | Description                                                                          |
| ------------------------------- | ------------------------------------------------------------------------------------ |
| `data: T[]`                     | The rows. Each mark uses them when it has no `data` of its own.                      |
| `x`, `y`                        | The channels of the two axes: a field name of `T`, or a function of the row.         |
| `series`                        | The channel that divides the rows into series. Without it, the chart has one series. |
| `key`                           | The channel that identifies a row. Without it, the row index is the key.             |
| `xScale`, `yScale`              | The type, the domain and the rounding of the scale of each axis (see below).         |
| `width`, `height`               | The size in pixels. Without `width`, the chart follows the width of its container.   |
| `margin`                        | The space around the plot. Without it, the root measures the axis labels.            |
| `focused`                       | The point that has the focus, or `null`. You can bind it with `bind:focused`.        |
| `selected`                      | The selected point, or `null`. You can bind it with `bind:selected`.                 |
| `onSelect(point)`               | The root calls it when the user activates a point with `Enter`, `Space` or a click.  |
| `locale`                        | The locale of the values in names, ticks, the tooltip and the data table.            |
| `xFormat`, `yFormat`            | The format of the values of each channel: `Intl` options, or a function.             |
| `aria-label`, `aria-labelledby` | The accessible name of the chart. One of the two, or a `Chart.Title`, is necessary.  |
| `aria-describedby`              | The id of an element that describes the chart, for example a summary of the trend.   |
| `class`, `element`, `context`   | The same as in `@human-kit/ui`.                                                      |

A mark can replace the `data` of the root with its own `data`, and then it can
have its own `x`, `y` and `series`. Thus one chart can show a line of sales and
a rule at each campaign date. A mark without `data` cannot have its own
channels (see open question 2).

### Scales

The default scale is linear. For another scale, import its function from its
subpath and give it as `type`:

```svelte
<script lang="ts">
	import { scaleTime } from '@human-kit/charts/scales/time';
</script>

<Chart.Root {data} x="date" y="value" xScale={{ type: scaleTime }} yScale={{ domain: [0, 100] }}>
```

| Scale    | Subpath                           | Values                |
| -------- | --------------------------------- | --------------------- |
| `linear` | `@human-kit/charts/scales/linear` | `number`              |
| `time`   | `@human-kit/charts/scales/time`   | `Date`                |
| `band`   | `@human-kit/charts/scales/band`   | `string` (categories) |

The root does not choose the scale from the values. A choice from the values
puts all of the scales in each bundle, also in a chart without dates. The time
scale adds about 0.9 kB gzip. In a development build, the root writes a warning
when the x values are dates and the x scale is not a time scale. It also writes a
warning when the x values are strings and the x scale is not a band scale.

The y scale includes zero by default (`zero: true`), and a bar needs it. Give
`yScale={{ zero: false }}` for a line that must fill the plot. The rule is
on the scale and not on the mark. The reason is that a server cannot see a mark
that is after a guide (see "Size and rendering on a server").

A band scale gives one band per category, in the order of the first appearance
in the data. The scale gives the middle of a band, and `bandwidth` gives its
width. `padding` is the space between two bands, as a fraction of a step. The
default is 0.2.

Each scale is also a pure function that you can use without a chart. The time
scale puts its ticks at calendar boundaries (years, quarters, months, Sundays,
days, hours, minutes and seconds). It makes its labels with
`Intl.DateTimeFormat`, and it does not include a calendar library.

### Formats

- A tick label shows only the largest calendar field that changes at the tick:
  "2020", "Mar", "Mar 5", "9:00 AM".
- The name of a point shows the value in full. A time scale chooses the
  precision from the data. Dates that are all on the first of January show as
  "2015". Dates in the middle of a month show as "Feb 3, 2015".
- `xFormat` and `yFormat` replace the format of the names and of the ticks.
  They are the options of `Intl.NumberFormat` or `Intl.DateTimeFormat`, or a
  function that receives the number or the date and returns the text.

### Marks

| Part         | Description                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------- |
| `Chart.Line` | Makes one `<path>` per series, and one focus target per point.                                                   |
| `Chart.Area` | Makes one filled `<path>` per series. `stacked` puts the series one on the other. The points show only on focus. |
| `Chart.Bar`  | Makes one `<rect>` per row. `layout` is `grouped` or `stacked`. Categories on y make horizontal bars.            |

A mark without a series channel has one series. Its `name` prop gives that
series a name for the legend, the names of the points and the data table.

A row without a finite value is a gap in the line. It is not a focus target.
In the data table, its cell is empty.

### Guides

| Part           | Description                                                                                   |
| -------------- | --------------------------------------------------------------------------------------------- |
| `Chart.Axis`   | Makes the ticks and the labels of one axis. `position` is `top`, `right`, `bottom` or `left`. |
| `Chart.Grid`   | Makes the grid lines of one axis.                                                             |
| `Chart.Legend` | Makes a list of the series. In version 1, a legend item does not hide a series.               |

The axes, the grid lines and the legend are not in the accessibility tree. The
same information is in the names of the points and in the data table.

## Accessibility

### Structure

- `Chart.Root` makes a `<figure>`. `Chart.Title`, when it is present, is the
  `<figcaption>`.
- The SVG of `Chart.Plot` has `role="application"`, the accessible name of
  the chart and `aria-roledescription="chart"`. The `application` role makes a
  screen reader go into focus mode on a point. Thus, the arrow keys come to the
  chart (see "Screen reader test" below).
- Each series is a group with the name of the series.
- Each point is an element with an accessible name that has all of its values,
  for example "March, North, revenue 58".
- The decoration (paths, axes, grid lines) has `aria-hidden="true"`.

Each point has `role="img"`.

### Screen reader test

The test used NVDA 2026.2 with Chrome on Windows, with real key presses:
`Tab` into the chart, then `ArrowRight`, `ArrowRight` and `ArrowDown`.

| Plot role     | Point role        | `Tab`                     | Arrow keys                                     |
| ------------- | ----------------- | ------------------------- | ---------------------------------------------- |
| `group`       | `img`             | Reads the chart and point | NVDA keeps them: it reads characters and lines |
| `group`       | `graphics-symbol` | Reads the chart and point | NVDA keeps them: it reads characters and lines |
| `application` | `img`             | Reads the chart and point | They move the focus; NVDA reads each point     |

With `application`, NVDA reads "Downloads per year, chart, Core, grouping,
2018, Core, 40, graphic" on `Tab`, then "2019, Core, 46" and "2020, Core, 55".
`ArrowDown` reads "Icons, grouping, 2020, Icons, 30". With `group`, the user
must know the NVDA command that changes to focus mode.

The `application` role removes the browse mode in the plot only. The title, the
legend and the data table stay in browse mode. The data table gives each
value in a table that the user can read cell by cell.

A second test used JAWS 2026 with Chrome on Windows. It used the same real key
presses on the line demo and the final roles (`application` and `img`). The
arrow keys come to the chart, and JAWS reads each point:

| Key          | JAWS reads                                  |
| ------------ | ------------------------------------------- |
| `Tab`        | "Core, 2018, Core, 40, graphic, Core group" |
| `ArrowRight` | "2019, Core, 46, graphic"                   |
| `ArrowRight` | "2020, Core, 55, graphic"                   |
| `ArrowDown`  | "Icons group, 2020, Icons, 30, graphic"     |
| `ArrowUp`    | "Core group, 2020, Core, 55, graphic"       |

JAWS does not read the name of the chart on `Tab`, but NVDA does. The title is
before the plot, thus a user in browse mode reads it before the plot.

The test with NVDA is the acceptance test of this RFC. The test with JAWS is
an additional check. VoiceOver is not tested.

### Keyboard

The plot is one tab stop. The focus moves with a roving `tabindex` over the
points, as in a grid of the WAI-ARIA APG.

| Key                       | Action                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `Tab`                     | Moves the focus into the plot, to the last focused point.                                                   |
| `ArrowRight`, `ArrowLeft` | Moves to the next or the previous point in the series.                                                      |
| `ArrowUp`, `ArrowDown`    | Moves to the point with the closest x value in the previous or the next series, in the order of the legend. |
| `Home`, `End`             | Moves to the first or the last point in the series.                                                         |
| `PageUp`, `PageDown`      | Moves ten points in the series.                                                                             |
| `Enter`, `Space`          | Selects the point and calls `onSelect`.                                                                     |
| `Escape`                  | Closes the tooltip. The focus stays on the point.                                                           |

The keys do not wrap: at the last point of a series, `ArrowRight` does nothing.

A stack shows its series in the order of the keyboard. On a vertical stack, the
first series is on the top, and `ArrowDown` goes down on the screen. On a
horizontal stack, the first series is next to zero, and `ArrowRight` goes to the
right. Thus the order of the legend is also the order of the stack.

The horizontal arrows follow the direction of the x axis on the screen, not the
text direction. A chart does not reverse its x axis in a right-to-left page.

A mark can have its categories on the y axis (horizontal bars). For that mark,
the vertical arrows move in the series and the horizontal arrows move between
the series. The name of a point, a row of the data table and the tooltip start
with the category.

### Selection

- `Enter`, `Space` or a click selects the point. A second time clears the
  selection. `bind:selected` holds the point.
- The selected point has `aria-current="true"` and `data-selected`. Its cell
  in `Chart.DataTable` has the same attributes.
- The selection follows the key and the series of the point, not the
  identity of the row. Without a `key` channel, the key is the row index. A parent that holds `selected` in a `$state` gets a
  proxy of the row, and a proxy is not equal to the row.
- In version 1, the table does not change the selection: it shows it.

### Focus

- The parts obey the focus contract of `@human-kit/ui`: `data-focused`,
  `data-focus-visible` and `data-focus-within`, with the same rules of
  modality.
- The focused point shows `data-focused`. The root shows `data-focus-within`.
- A pointer press on a point moves the focus to it without a focus ring. A key
  press after it shows the ring.
- The focus stays on the same row after a data update, when that row is still
  in the data. Rows are found by a `key` channel. Without it, the row index is
  the key.

### Tooltip

- `Chart.Tooltip` opens on the focused point and on the point under the
  pointer.
- On a touch screen, a tap opens the tooltip on the nearest point. It stays
  when the finger lifts. A tap out of the plot, or a finger that scrolls the
  page, closes it.
- The tooltip stays in the width of the figure. Near an edge, it moves away
  from the point, thus it does not make the page wider on a narrow screen.
- It opens on a focus only when the focus came from the keyboard, as the
  tooltip of `@human-kit/ui` does.
- The screen reader reads the accessible name of the point. The tooltip does
  not repeat it, thus the tooltip has `aria-hidden="true"`.
- The tooltip never contains a control, and it never takes the focus.
- A value is never available only in the tooltip.

### Data table

- `Chart.DataTable` makes a `<table>` with all of the values of the chart, a
  `<caption>`, and `scope` on the header cells.
- `visibility` is `visible` or `screen-reader`. With `screen-reader`, the table
  is in the accessibility tree but not on the screen.
- The cell of the selected point has `aria-current="true"`.

### Other requirements

- The chart is correct in `forced-colors` mode. The marks use system colors
  there.
- A series is never identified by color alone. The legend and the names of the
  points give the name of the series.
- The library makes no live region in version 1. A focus move makes the screen
  reader read the name of the point, and a data update must not interrupt the
  user.

## Size and rendering on a server

- The root makes the SVG on the server with the `width` prop, or with a default
  width of 640 pixels. After the mount, it measures the container with a
  `ResizeObserver`.
- Without the `width` prop, the SVG has `width="100%"` until the first
  measure. The `viewBox` keeps the default width, thus the browser scales the
  chart to its container. On a narrow screen, the chart does not make the page
  wider before the hydration. After the measure, the width is in pixels and
  the chart draws again at the real size.
- Each axis measures its labels after the mount, and asks the root for the
  space. The margin of a side is the largest space that an axis asks for. A
  change below one pixel does not count, thus the measures stop.
- On a server, a `$derived` value keeps the value of its first read, and the
  parts read the values in markup order. Thus:
  - The root makes its domains from its own `data` and channels, which are
    complete before the first part starts. A chart with only root data has the
    correct scales on the server, in all orders of the parts.
  - A mark with its own `data` or channels, and a stacked `Chart.Bar`, add
    values when they start. On the server, the parts before them do not see the
    values: a grid before a stack has the domain of one bar. Give the domain, or
    put the mark before the guides.
  - The margins on the server are the minimum margins, because the guides
    before an axis do not know that axis. The labels of the axes are clipped
    until the first measure in the browser.
- The chart does not move after the mount when the consumer gives `width` and
  `margin`. Give `margin` for a page that the server makes.

## Repository layout

The repository follows the layout of `@human-kit/ui`:

- `packages/charts/`: the publishable package, `@human-kit/charts`.
- `docs/`: the documentation site and the live demos (after the prototype).
- `rfcs/`: the design documents.
- `.changeset/`: versions and release notes.
- `scripts/`: the size check, the ASD-STE100 check and the TODO check.

Tools: pnpm, Svelte 5 with runes, TypeScript, Vitest in browser mode, and
changesets. The docs site is on Vercel and uses `@human-kit/markdown`.

## Tests

- Unit tests for each scale, the tick algorithm, the path generators and the
  stack transform.
- Browser tests for the keyboard table, the focus contract and the selection.
- Server tests: each part makes the same markup on the server as on the client.
- An accessibility tree test for each mark: names, roles and hidden elements.
- A manual test with NVDA before each minor version.

## Prototype plan

The prototype answers the open questions before the full implementation:

1. `Chart.Root`, the linear scale, `Chart.Line` and the keyboard table.
2. Measure the gzip size of that chart.
3. Test the roles of the structure with NVDA, JAWS and VoiceOver.
4. Test the generic types from `Chart.Root` to the marks.

## Prototype results

Steps 1 and 2 are complete (2026-10-09).

- `Chart.Root`, `Chart.Title`, `Chart.Plot`, `Chart.Line`, `Chart.Area` and
  `Chart.Bar` are in `packages/charts`. `Chart.Bar` has vertical and horizontal
  bars, grouped and stacked. `Chart.Axis`, `Chart.Grid`, `Chart.Legend`,
  `Chart.Tooltip`, `Chart.DataTable`, and the linear, time and band scales are
  also in `packages/charts`.
- Each part holds its own logic. The legend, the tooltip and the data table
  read the marks through the context, thus a chart without them does not
  include their code.
- Sizes from `pnpm size`, gzip, without the Svelte runtime:

  | Chart                                                     | Size    |
  | --------------------------------------------------------- | ------- |
  | A line with the keyboard operation                        | 5.09 kB |
  | A line on a time scale, two axes and a grid               | 7.21 kB |
  | Stacked bars on a band scale, axes and grid               | 6.84 kB |
  | Stacked areas, axes, grid, legend, tooltip and data table | 9.66 kB |

  The support for categories in the root adds about 0.2 kB to each chart.

- Problems that the prototype found:
  1. The names used one number format for all of the values, thus a year
     showed as "2,014". Fixed: each channel has its own format, and the time
     scale writes dates.
  2. `ArrowDown` moves to the next series in the order of the data, not to the
     series below on the screen. When the lines cross, the order on the screen
     changes from one x value to the next. See open question 3.
  3. On a server, a `$derived` value does not change after its first read. See
     "Size and rendering on a server".
  4. A key press before the hydration does nothing: the point has the focus,
     but no handler is on it yet. The page must not hold a server markup for
     a long time before the hydration.

## Open questions

1. **The roles of the points.** Decided for NVDA and JAWS: `role="application"` on the
   plot and `role="img"` on each point (see "Screen reader test"). The
   `graphics-symbol` role gives the same result as `img` and less support. A
   `grid` is not necessary, because `application` already gives the arrow keys
   to the chart. JAWS gives the same result. VoiceOver is not tested.
2. **The type of the marks.** Decided: a mark can have its own channels only
   when it has its own `data`. A child component cannot get the generic type
   of its parent in Svelte 5, thus a channel on a mark without `data` cannot be
   checked. The props of a mark are a union: `data` with the channels, or none
   of them. A channel without `data` is a type error. The candidates were a
   typed factory, for example `const Chart = createChart<Sale>()`, and this
   rule. The factory puts all of the parts in one object, and a bundler then
   includes all of them in each chart. The rule adds no bytes. To show a second
   field of the root rows, give the rows to the mark again:
   `<Chart.Line data={sales} y="cost" />`.
3. **The order of the series for `ArrowUp` and `ArrowDown`.** Decided: the
   order of the legend. The candidates were the order of the legend and the
   order on the screen at the focused x value. The order of the legend does not
   change, and the order on the screen follows the lines. A user who cannot see
   the chart knows only the order of the legend. Two marks can show series with
   the same name. Then `ArrowDown` goes from a series in one mark to the series
   with the same name in the next mark.
4. **The keyboard model for a bar chart.** Decided: the same model as for a
   line. The arrows along the axis of the categories move in a series. The
   other arrows move between the series, in the order of the legend. A stack
   puts its series in that order on the screen. On a vertical stack, the
   first series is on the top, thus `ArrowDown` goes down on the screen. On a
   horizontal stack, the first series is next to zero, thus `ArrowRight` goes
   to the right. Before, the first series was at the bottom of a vertical
   stack, and `ArrowDown` went up. In a grouped layout, `ArrowDown` goes to the
   next bar of the group, which is on its right. The name of the bar gives the
   series. The other candidate, the order of the screen, makes a bar chart
   different from a line chart.
5. **The default width on the server.** Decided: 640 pixels in the `viewBox`,
   and `width="100%"` on the SVG until the first measure. A fixed width of 640
   pixels made a page wider than a phone screen until the hydration. The
   height does not change, thus the page does not move when the chart gets its
   real width. The chart does not animate the change: there is no animation in
   version 1.
6. **The name of a value.** Decided: the name does not include the field.
   A point is "2015, South, 66". A field name is a name in the code, for
   example `revenue_usd`, and not a text for a user. When two marks show two
   fields of the same rows, each mark gets a `name`, which is the name of its
   series: "2015, Cost, 40". The legend and the data table show the same name.
   Without it, the two series have no name, and the data table shows only the
   first one.
