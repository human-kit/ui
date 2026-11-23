---
title: Chart Accessibility
description: How a chart of @human-kit/ui is accessible — one tab stop, arrow-key navigation over the data, a name for every point, a data table, and the parts you still provide.
---

<script>
	import { Demo } from '$lib/docs/components/index.js';
	import Table from './demos/table.svelte';
	import tableSource from './demos/table.svelte?highlight';
</script>

# Accessibility

Accessibility is the primary requirement of this library. A keyboard user and a screen reader user get the same data as a pointer user. The parts set the roles, the names and the keyboard operation. You give the title, the colors and the styles.

<Demo source={tableSource}><Table /></Demo>

## Structure

- `Chart.Root` makes a `<figure>`. `Chart.Title`, when it is present, is the `<figcaption>`.
- The `<svg>` of `Chart.Plot` has `role="application"`, `aria-roledescription="chart"` and the accessible name of the chart.
- Each series is a group with the name of the series.
- Each point has `role="img"` and an accessible name with all of its values.
- The paths, the axes, the grid lines and the legend have `aria-hidden="true"`. The names of the points and the data table give the same information.

## Screen readers

A screen reader in browse mode keeps the arrow keys for its own reading. The `application` role tells it to go into focus mode when a point gets the focus. Then the arrow keys come to the chart, and the screen reader reads each point that gets the focus.

With NVDA and Chrome, `Tab` reads "Downloads per year, in thousands, chart, Core, grouping, 2018, Core, 40, graphic". `ArrowRight` then reads "2019, Core, 46", and `ArrowDown` reads "Icons, grouping, 2019, Icons, 27".

The title, the legend and the data table are out of the plot, thus they stay in browse mode. Use the data table to read the values cell by cell.

The test used NVDA, and a second test used JAWS. VoiceOver is not tested.

## Keyboard

The plot is one tab stop. The focus moves with a roving `tabindex` over the points.

| Key                       | Action                                                                          |
| ------------------------- | ------------------------------------------------------------------------------- |
| `Tab`                     | Moves the focus into the plot, to the last focused point.                       |
| `ArrowRight`, `ArrowLeft` | Moves to the next or the previous point in the series.                          |
| `ArrowUp`, `ArrowDown`    | Moves to the point with the closest x value in the previous or the next series. |
| `Home`, `End`             | Moves to the first or the last point in the series.                             |
| `PageUp`, `PageDown`      | Moves ten points in the series.                                                 |
| `Enter`, `Space`          | Selects the point, or clears the selection of a selected point.                 |
| `Escape`                  | Closes the tooltip. The focus stays on the point.                               |

The keys do not wrap. At the last point of a series, `ArrowRight` does nothing.

The horizontal arrows follow the direction of the x axis on the screen, not the direction of the text.

A mark can have its categories on the y axis, as horizontal bars do. Then the vertical arrows move in the series, and the horizontal arrows move between the series.

A dot mark puts the dots of a series in the order of x, then of y. When two dots of the next series have the same distance in x, `ArrowDown` goes to the dot with the closest y value.

An arc mark has one series, thus all of the arrows move in it. `ArrowRight` and `ArrowDown` go to the next slice, in the clockwise direction. `ArrowLeft` and `ArrowUp` go to the previous slice.

`ArrowUp` and `ArrowDown` move between the series in the order of the legend. This order does not change when two lines cross on the screen. Two marks can show a series with the same name, for example an area and a line. Then `ArrowDown` goes to that series in the next mark before it goes to the next series.

## Names

The name of a point has the category or the x value first, then the name of the series, then the value. For example, "Q2, North, 31". The values use the formats of the chart: `xFormat`, `yFormat` and `locale`.

With `xLabel` and `yLabel` on `Chart.Root`, each value comes after the label of its channel. A dot starts with the series, because its two values are both measures: "Europe, Weight (lb) 2,130, Fuel economy (mpg) 31".

A slice of an arc mark adds its share of the total after the value: "Solar, Energy (GWh) 412, 37.9%".

The name does not include the name of the field. A field name is a name in the code, for example `revenue_usd`. It is not a text for a user. When two marks show two fields of the same rows, give each mark a `name`. The name is the name of the series of the mark, thus a point is "2015, Cost, 40" and not "2015, 40".

A time scale writes a date as precise as the data. Dates that are all on the first of January show as "2025". Dates on the first of a month show as "March 2025".

## Focus

The parts obey the same focus contract as the other components:

- The focused point has `data-focused`.
- The focused point has `data-focus-visible` only when the focus came from the keyboard. Show the focus ring with this attribute.
- A pointer press on a point moves the focus to it without a focus ring. A key press after it shows the ring.
- The root has `data-focus-within` while a point has the focus.

## Tooltip

- `Chart.Tooltip` opens on the point under the pointer, and on the focused point when the focus came from the keyboard.
- The screen reader reads the name of the focused point. Thus the tooltip has `aria-hidden="true"`, and it does not say the values a second time.
- The tooltip never contains a control, and it never takes the focus.
- A value is never available only in the tooltip.

## Data table

`Chart.DataTable` makes a `<table>` with all of the values of the chart. It has one row for each category or x value, one column for each series, and `scope` on each header cell.

The default `visibility` is `screen-reader`: the table is in the accessibility tree, but not on the screen. Give `visibility="visible"` to show it to all of the users.

## Selection

`Enter`, `Space` or a click selects the focused point. A click or a tap less than 40 pixels from a point also selects it, because a point can be smaller than a finger. A second time clears the selection. The selected point has `aria-current="true"` and `data-selected`, and its cell in the data table has the same attributes. The table shows the selection, but a click on the table does not change it.

## What you must provide

The parts cannot know three things. You must give them:

- **A name.** Give a `Chart.Title`, or `aria-label` or `aria-labelledby` on `Chart.Root`. A chart without a name is a group with no name for a screen reader. Give `aria-describedby` for a summary of the trend.
- **Color contrast.** The parts set no color. Make the lines, the bars, the focus ring and the text of the axes meet the contrast requirements of WCAG.
- **More than color.** Do not identify a series by color alone. Show a `Chart.Legend`, put a label on each line, or use a different dash pattern or shape for each series.

## Forced colors

In the forced colors mode of Windows, the browser replaces the colors of the page. A mark draws with `currentColor`, thus it stays visible. Use the system colors, for example `CanvasText` and `Highlight`, in your styles for this mode.

## How to check it

The tests of the package examine the keyboard table, the focus contract and the selection in a true browser. Other tests examine the markup that the server makes. Test your own charts with a screen reader, because the support for the roles of a chart is different in each screen reader.
