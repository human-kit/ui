---
title: Chart.Rule
description: Chart.Rule draws a reference line across a Svelte chart at a target, a limit or an average, with its value in the plot description and in the data table.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import api from './api.json';
</script>

# Rule

`Chart.Rule` draws one straight line across the plot at a fixed value, for example a target, a limit or an average. A rule at a y value is a horizontal line. A rule at an x value is a vertical line. Each rule has a short label.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleBand } from '@human-kit/ui/chart/scales/band';

	type Month = { month: string; sales: number };
	let { months }: { months: Month[] } = $props();

	const average = $derived(months.reduce((sum, m) => sum + m.sales, 0) / months.length);
</script>

<Chart.Root data={months} x="month" y="sales" yLabel="Sales" xScale={{ type: scaleBand }}>
	<Chart.Title>Sales per month</Chart.Title>
	<Chart.Plot>
		<Chart.Rule value={120} label="Target" />
		<Chart.Rule value={average} label="Average" />
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Bar />
	</Chart.Plot>
	<Chart.DataTable />
</Chart.Root>
```

A rule makes a `<g>` with a `<line>`, a `<text>` with the label, and a `<desc>` with the description. The line goes from one edge of the plot to the other. The label goes at the end of the line: at the right of a horizontal rule, and at the top of a vertical rule.

## Values

- `value` is a number, a date, or a category of a band scale. A date needs a time scale, and a category needs a band scale.
- On a band scale, the line goes through the middle of the band of the category.
- A number or a date goes into the domain of its axis. Thus a target above all of the data is in the plot.
- A category that is not on the scale makes no line, because a rule does not add a category.
- A value that is not a finite number, or a value out of a domain that you give, makes no line. In a development build, the rule writes a warning.

`value` is a value, not a function of the data. Calculate an average or a median in your code, as the anatomy shows.

## Order

Put the rules first in `Chart.Plot`, before the guides and the marks:

- On a server, the scales use the values that come before the first guide. A rule after the guides is not in the domain of the server markup.
- A rule before the marks does not hide the focus ring of a point.

## Accessibility

A rule is not a value of the data. It is a reference for the values. Thus it is not a point. The keyboard does not stop on it, and the pointer does not open a tooltip on it. It has `aria-hidden="true"`. Three other channels give its label and its value.

### The description of the plot

Each rule adds the id of its `<desc>` to the `aria-describedby` of the plot, after the ids that you give. The text is the label, then the value in the format of the point names: "Target, Sales 120". A screen reader can read it when the focus goes into the plot.

The plot writes its attributes before the rules in it start. Thus the server markup has no ids of the rules, and the client adds them when it hydrates the chart.

### The data table

`Chart.DataTable` adds a `<tfoot>` with one row for each rule. The header cell of the row is the label. One cell gives the value, and it spans the other columns. A rule is not a row of the data, thus its row is apart from the data rows.

### The point names

Give `compare` to put a comparison in the name of each point. It is a function of the point and the value of the rule. Its text goes at the end of the name: "Mar, Sales 132, at target". An empty text adds nothing, thus a function can name only the values above a limit.

```svelte
<Chart.Rule
	value={120}
	label="Target"
	compare={(point, target) => (point.y >= target ? 'above target' : 'below target')}
/>
```

The library gives no default text. Write the words in the language of your users.

## Styles

The rule sets no color, no width and no dash pattern. The line and the label use `currentColor`. Give the line a dash pattern: then it is different from a grid line also without color. The pattern stays in the forced colors mode. Use the system color of the text in that mode.

```css
.chart [data-rule] {
	color: #b91c1c;
	pointer-events: none;
}

.chart [data-rule] line {
	stroke-dasharray: 6 4;
}

@media (forced-colors: active) {
	.chart [data-rule] {
		color: CanvasText;
	}
}
```

Keep the line thinner than the focus ring of a point. A label can move with a CSS `transform`.

| Element          | Attribute   | When                                    |
| ---------------- | ----------- | --------------------------------------- |
| Group of a rule  | `data-rule` | Always.                                 |
| Group of a rule  | `data-axis` | Always. The value is `x` or `y`.        |
| Row of the table | `data-rule` | On the row of each rule in the `tfoot`. |

## API reference

<ApiReference api={api} />
