---
title: Chart.DataTable
description: Chart.DataTable gives every value of a Svelte chart as an HTML table, for screen readers only or for all users, with the selected point marked.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# DataTable

`Chart.DataTable` makes a `<table>` with all of the values of the chart. A table is the most reliable way for a screen reader user to read and compare the data. Each chart must have one.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<Chart.Root data={rows} x="month" y="output" series="source">
	<Chart.Title>Energy output</Chart.Title>
	<Chart.Plot>
		<Chart.Line />
	</Chart.Plot>
	<Chart.DataTable />
</Chart.Root>
```

The table is HTML, thus it goes in `Chart.Root` and not in `Chart.Plot`.

## Rows and columns

- The table has one row for each category or x value, in the order of the values.
- It has one column for each series. Two marks with one series name make one column.
- The first column has the category or the x value of each row, in a header cell with `scope="row"`.
- A cell is empty when its series has no point at that value.

For horizontal bars, the rows follow the categories on the y axis.

A dot mark makes a table with one row for each dot, because two dots can have the same x value. The columns are the series, x and y, and the rows are in the order of the keyboard. No column identifies a row, thus the rows have no header cell.

An arc mark makes a table with one row for each slice, and a last column with the share of each slice. The header of that column is "%".

The first mark of the chart sets the form of the table.

The header of a column of values is the `xLabel` or the `yLabel` of the root. Without a label, it is the name of the field of the channel. Give `rowHeader` for a text of your own in the first column. A series without a name gets the name of the field of the value channel. A channel that is a function has no field name, thus its header is `x` or `y`.

## Visibility

`visibility` sets who can see the table:

- `screen-reader` (the default) keeps the table in the accessibility tree, but not on the screen.
- `visible` shows the table to all of the users.

## Caption

Without `caption`, the table has `aria-labelledby` with the id of `Chart.Title`. Thus the table and the chart have the same name. Give `caption` to make a `<caption>` with a text of your own.

## Selection

The cell of the selected point has `aria-current="true"` and `data-selected`. In a table with a row for each dot or each slice, the row of the selected point has them. Select a point in the demo with `Enter`, and look at the table. In version 1, a click on the table does not change the selection.

## Styles

| Element                    | Attribute         | Value                         |
| -------------------------- | ----------------- | ----------------------------- |
| Table                      | `data-data-table` | Empty.                        |
| Table                      | `data-visibility` | `visible` or `screen-reader`. |
| Cell of the selected point | `data-selected`   | `true`.                       |

With `screen-reader`, the table has an inline style that removes it from the screen. Do not give it a `display` or a `position` in your CSS.

## API reference

<ApiReference api={api} />
