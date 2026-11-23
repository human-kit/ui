# RFC 0004: The rule mark (reference lines)

- **Status:** Accepted
- **Date:** 2026-10-29
- **Scope:** version 0.6
- **Depends on:** [RFC 0001](0001-architecture.md), [RFC 0002](0002-dot-mark.md), [RFC 0003](0003-arc-mark.md)

## Summary

`Chart.Rule` is a new part. It draws one straight line across the plot at a
fixed value: a target, a limit or an average. A rule at a y value is a
horizontal line. A rule at an x value is a vertical line. A rule has a short
text label, for example "Target".

The marks of RFC 0001, RFC 0002 and RFC 0003 show the rows of the data. A
rule shows one value that is not a row. Thus it is not a point: the keyboard
does not stop on it. This RFC tells how a screen reader user gets the rule
without a focus stop, and which parts of the root change for it.

## Goals

- A screen reader user gets the label and the value of each rule, with no
  additional key press in the plot.
- A screen reader user can compare a point with a rule without a second pass
  over the chart.
- The data table shows the value of each rule.
- A rule is not identified by color alone. Its label tells what it is, and
  the documentation CSS gives it a dash pattern.
- A chart that does not import `Chart.Rule` does not get larger, except for
  the changes to the existing parts that this RFC lists.

## Non-goals

- A band between two values, for example a range of normal values. It is a
  filled shape with two edges, and it comes in a later RFC.
- A rule at a value of each row, for example a line at each campaign date.
  RFC 0001 tells about this case. In this version, an `{#each}` block over
  the dates makes one rule for each date.
- A rule that the user can move with the pointer or the keyboard. A rule is
  not an input.
- A tooltip on a rule. The label and the data table give its value.
- Options for the place of the label. The label goes at the end of the line.
  CSS can move it with a `transform`.
- A diagonal line, for example a trend line. Its values come from a
  regression, and the application prepares the data, as in RFC 0001.

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleBand } from '@human-kit/charts/scales/band';

	type Month = { month: string; sales: number };
	let { months }: { months: Month[] } = $props();

	const average = $derived(months.reduce((sum, m) => sum + m.sales, 0) / months.length);
</script>

<Chart.Root data={months} x="month" y="sales" yLabel="Sales" xScale={{ type: scaleBand }}>
	<Chart.Title>Sales per month</Chart.Title>
	<Chart.Plot>
		<Chart.Rule value={120} label="Target" />
		<Chart.Grid axis="y" />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Bar />
		<Chart.Rule value={average} label="Average" />
	</Chart.Plot>
	<Chart.DataTable />
</Chart.Root>
```

## API

### `Chart.Rule`

| Prop      | Description                                                                                         |
| --------- | --------------------------------------------------------------------------------------------------- |
| `value`   | The value of the rule: a number, a date, or a category of a band scale.                             |
| `axis`    | The axis of the value. `y`, the default, makes a horizontal line. `x` makes a vertical line.        |
| `label`   | The text of the rule, for example "Target". It is necessary.                                        |
| `compare` | Optional. A function of a point and the value of the rule. Its text goes at the end of point names. |
| `class`   | The class of the `<g>` element of the rule.                                                         |

The prop `axis` has the same meaning as on `Chart.Grid`: it names the axis of
the value, and the line goes across the plot. A grid line and a rule then use
one word for one concept.

A rule makes this markup:

```svelte
<g class={className} data-rule="" data-axis="y" aria-hidden="true">
	<line x1={left} x2={right} y1={y} y2={y} stroke="currentColor" />
	<text x={right} {y} dy="-0.32em" text-anchor="end" fill="currentColor">Target</text>
</g>
```

The line goes from one edge of the plot to the other. On a band scale, the
line goes through the middle of the band of the category. The label goes at
the end of the line: at the right for a horizontal rule, and at the top for a
vertical rule. The library sets no color, no width and no dash pattern.

### Values

- The value goes into the domain of its axis, as the values of a mark with
  its own data do. A target above all of the data is then in the plot. The
  rules of RFC 0001 for the server apply: give the domain, or put the rule
  before the guides.
- A value that is not a finite number, or a category that is not on the
  scale, makes no line. In a development build, the rule writes a warning.
- A date needs a time scale, and a category needs a band scale, as for the
  data of the root.

### The value of an average

`value` is a value, not a function of the data. The application calculates
an average or a median, as the anatomy shows. A function of the rows needs
the row type `T`, and a part without `data` cannot get it (RFC 0001, open
question 2). Also, the library does not include aggregation (RFC 0001,
non-goals).

## Accessibility

### A rule is not a point

A rule is not a value of the data. It is a reference for the values. The
roving focus of RFC 0001 goes over the values only, as a grid of the WAI-ARIA
APG goes over its cells only. A focus stop on a rule has these problems:

- The keyboard has no clear order for it. A horizontal rule crosses all of
  the series, thus `ArrowDown` has no single next point.
- The user hears the rule each time the focus passes it, also when the user
  wants only the next value.
- `Enter` on a rule has no action, because a rule is not a row for
  `onSelect`.

Thus the rule is not in the roving focus, it has `aria-hidden="true"`, and
the pointer does not open a tooltip on it. The three channels below give its
information.

### Channel 1: the description of the plot

The plot already has a name and an optional `aria-describedby`. Each rule
adds the id of a text with its label and its value. The plot lists those ids
after the id from the consumer:

```svelte
<svg role="application" aria-describedby="summary chart-1-rule-0 chart-1-rule-1">
```

The text of a rule is "Target, Sales 120": the label, then the value in the
format of the point names of RFC 0001. With the description, a screen reader
can read the rules when the focus goes into the plot. The text is in an
element with `aria-hidden="true"` in the rule. An id reference reads the
text of a hidden element, thus the element does not show twice.

The prototype must test this channel with NVDA. In the test of RFC 0001,
JAWS did not read the name of the plot on `Tab`. If a screen reader does not
read the description, the data table and the point names still give the
rule.

### Channel 2: the data table

`Chart.DataTable` adds a `<tfoot>` with one row for each rule. The row header
is the label of the rule. One cell gives the value, and it spans the other
columns:

```svelte
<tfoot>
	<tr data-rule="">
		<th scope="row">Target</th>
		<td colspan="2">120</td>
	</tr>
</tfoot>
```

The table stays in browse mode, as in RFC 0001. A user can read the rules
after the values, cell by cell. A rule is not a row of the data, thus a
footer row keeps it apart from the data rows.

### Channel 3: the point names, on request

A sighted user sees at once that a bar is above the target. A screen reader
user must remember the value of the target and compare each value. The
`compare` prop puts this comparison in the name. It is a function of the point and the value
of the rule. Its text goes at the end of the name of the point:

```svelte
<Chart.Rule
	value={120}
	label="Target"
	compare={(point, target) => (point.y >= target ? 'above target' : 'below target')}
/>
```

With it, the name of a bar is "March, Sales 132, above target". An empty
text adds nothing. Thus a function can name only the values above a limit.

The library gives no default text. The words "above" and "below" need a
translation, and the library has no texts of its own (RFC 0003, the share
column). The function also lets the application choose the words, for
example "over the limit" or "late".

### Other requirements

- The label of a rule is necessary. A line without a label is identified by
  its place alone, and a screen reader user gets only a number.
- In `forced-colors` mode, the rule uses the system color of the text. The
  documentation CSS gives the rule a dash pattern, thus it is different from
  a grid line also without color. A dash pattern stays in `forced-colors`
  mode.
- A rule does not hide the focus ring of a point. The documentation puts the
  rule before the marks, or gives the line `pointer-events: none` and a
  stroke that is thinner than the focus ring.

## Changes to the existing parts

| Part              | Change                                                                                  |
| ----------------- | --------------------------------------------------------------------------------------- |
| `ChartContext`    | `rules` and `rule(rule)`, a second list next to the marks. A rule is not a `ChartMark`. |
| `Chart.Root`      | Adds the values of the rules to the domains, and adds the text of `compare` to names.   |
| `Chart.Plot`      | Adds the ids of the rules to `aria-describedby`.                                        |
| `Chart.DataTable` | The `<tfoot>` with one row for each rule.                                               |
| `Chart.Legend`    | No change. A rule has a label on the plot, thus the legend does not list it.            |
| Navigation        | No change. The rules are not in `entries`, thus the arrow keys do not stop on a rule.   |

A rule does not register with `ctx.register`. The data table and the legend
read `ctx.marks[0]` to find the layout of the chart. A rule before the first
mark then changes the layout of the table. A second list keeps the marks as
they are.

## Size

The rule is a subpath export of its own. A chart that does not import it gets
only the changes to the root, the plot and the data table. Each change must
be smaller than 0.1 kB gzip, or this RFC changes. The rule itself must be
smaller than 0.6 kB gzip.

A new fixture, "bars with a target rule and a data table", goes into
`pnpm size`. The fixtures that exist now must stay in 0.1 kB of their sizes
before this RFC.

## Tests

- Unit tests for the place of the line: a linear scale, a time scale, a
  band scale, and a value out of the given domain.
- A domain test: a rule above all of the data extends the y domain.
- A browser test: the arrow keys and `Tab` do not stop on a rule.
- A browser test: the pointer does not open a tooltip on a rule.
- An accessibility tree test: the rule is hidden, and the plot has the
  description with the label and the value.
- A name test: `compare` adds its text, and an empty text adds nothing.
- A data table test: the `<tfoot>` row, its header and its `colspan`.
- A server test: the same markup on the server and on the client.
- A manual test with NVDA and Chrome before the minor version, with real key
  presses, as in RFC 0001. It also tells whether NVDA reads the description.

## Prototype plan

1. `Chart.Rule` on a linear y scale, with the label, and its value in the
   domain.
2. The vertical rule on a time scale and on a band scale.
3. The description of the plot.
4. The `<tfoot>` of the data table.
5. The `compare` prop.
6. Measure the size of each step.
7. The NVDA test. If NVDA does not read the description, see open question 3.

## Prototype results

None yet.

## Open questions

1. **The name of the part.** Decided: `Chart.Rule`. A part has the name of
   its shape, as RFC 0002 decided. RFC 0001 already uses the word "rule" for
   this line. The candidates are `Chart.ReferenceLine`, which is long, and
   `Chart.Threshold`, which names one use only.
2. **A rule as a point.** Decided: not a point. A rule is a reference and
   not a value of the data (see "A rule is not a point"). The candidate is a
   focus stop on each rule, after the points of the series. It gives the
   name of the rule on the plot. But the keyboard has no clear order for it,
   and `Enter` has no action on it.
3. **How a screen reader user gets the rule.** Decided: the description
   of the plot and a `<tfoot>` row of the data table, with `compare` for the
   point names. The candidates are:
   - A name on the element of the rule. In the `application` role, a screen
     reader reads only the focused element, thus it does not read the name.
   - A row in the body of the data table. A rule is not a row of the data,
     and it has no value for each column.
   - A live region. RFC 0001 has no live region, because a data update must
     not interrupt the user.
   - The point names only. A user who does not use the plot does not get the
     rule.
4. **The text of the point names.** Decided: no text by default, and the
   `compare` prop on request. One candidate is a default text "above" and
   "below", which needs a translation. The other is no text at all. Then a sighted user
   gets more information than a screen reader user.
5. **The prop of the orientation.** Decided: `axis`, with the values `x`
   and `y`, as on `Chart.Grid`. The candidate is `orientation`, with the
   values `horizontal` and `vertical`. It names the line and not the value,
   thus `orientation="horizontal"` goes with a y value, and that is easy to
   get wrong.
6. **A value from the data.** Decided: `value` is a value only. The
   candidate is a function of the rows, for example `value={mean}`. It needs
   the type `T`, which a part without `data` cannot get, and the library does
   not include aggregation.
7. **The label.** Decided: necessary in the type. The candidate is an
   optional label with a warning in a development build. A rule without a
   label has no name for a screen reader user.
8. **The domain.** Decided: the value of a rule goes into the domain. The
   candidate is a rule that shows only in the domain of the data. That rule
   is not on the plot when the target is above all of the values, but the
   description still gives it. A sighted user then does not see what a
   screen reader user hears.
9. **The registration.** Decided: a second list in the context, next to
   the marks. The candidate is `ctx.register` with a mark that has no
   points. It adds no list, but each part that reads `ctx.marks[0]` must then
   skip the rules.
