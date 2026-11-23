# RFC 0007: Brush and zoom

- **Status:** Draft
- **Date:** 2026-10-29
- **Scope:** version 0.7 or later
- **Depends on:** [RFC 0001](0001-architecture.md)

## Summary

`Chart.Brush` is a new part. It shows a range of x values on the plot, with
two thumbs at the ends of the range. The user moves a thumb with the keyboard
or with a pointer. The range is a bindable prop.

A brush does not change its own chart. To zoom, the application gives the
range to a second chart, the detail chart, and that chart shows only the rows
in the range. The first chart, the overview, always shows all of the data.

RFC 0001 put brush, zoom and pan out of version 1. This RFC is a draft. The
open questions at the end have recommendations, but the user decides them.

This part has more behavior than a mark. A mark draws the data and lets the
root control the keyboard. A brush has its own controls, its own pointer
gestures and its own state. Thus this RFC recommends a small first version,
and it puts the other features in later RFCs.

## Goals

- A keyboard user and a screen reader user can set the range, with the same
  result as a pointer user.
- Each thumb is a slider, as in the multi-thumb slider pattern of the WAI-ARIA
  APG. The screen reader reads the value of a thumb in the format of the
  chart, for example "March 2020" and not a number of milliseconds.
- A pointer user can set the range with a drag, and also with a single click
  or a tap, without a drag.
- The detail chart, its names and its data table show only the rows in the
  range.
- A chart that does not import `Chart.Brush` does not get larger, except for
  the change in the root that this RFC lists.

## Non-goals

- A range on the y axis, and a range on two axes at once.
- A brush on a chart with its categories on the y axis, for example
  horizontal bars, and on an arc mark, which has no axis.
- Zoom in place: a chart that changes its own x domain after a drag. See open
  question 3.
- Zoom and pan with the wheel, with two fingers, or with the `+` and `-` keys.
- A key that moves the whole range at once. See open question 5.
- Animation of the change of the range.
- A brush that selects points, for example to export them. The brush gives a
  range of x values. The application can find the rows in it.

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleTime } from '@human-kit/charts/scales/time';

	type Sale = { month: Date; revenue: number };
	let { sales }: { sales: Sale[] } = $props();

	// No range means all of the data.
	let range: [Date, Date] | undefined = $state();
	const visible = $derived.by(() => {
		if (!range) return sales;
		const [from, to] = range;
		return sales.filter((s) => s.month >= from && s.month <= to);
	});
</script>

<!-- The overview: all of the data, and the brush. -->
<Chart.Root data={sales} x="month" y="revenue" xScale={{ type: scaleTime }} height={80}>
	<Chart.Title>Revenue per month, all years</Chart.Title>
	<Chart.Plot>
		<Chart.Axis position="bottom" />
		<Chart.Line />
		<Chart.Brush bind:range aria-label="Months to show" startLabel="From" endLabel="To" />
	</Chart.Plot>
</Chart.Root>

<button type="button" onclick={() => (range = undefined)}>Show all months</button>

<!-- The detail: only the rows in the range. -->
<Chart.Root data={visible} x="month" y="revenue" xScale={{ type: scaleTime }}>
	<Chart.Title>Revenue per month</Chart.Title>
	<Chart.Plot>
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
```

## API

### `Chart.Brush`

| Prop                            | Description                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `range`                         | The first and the last x value in the range. Without it, the range has all of the values. Bind it: `bind:range`. |
| `controlledRange`               | The component does not write `range`. It reports each change only through `onChange`. The default is off.        |
| `onChange(range)`               | The component calls it on each change, also on each move of a drag.                                              |
| `onChangeEnd(range)`            | The component calls it at the end of a change: at the release of a key, and at the end of a drag.                |
| `aria-label`, `aria-labelledby` | The name of the group of the two thumbs, for example "Months to show".                                           |
| `startLabel`, `endLabel`        | The names of the two thumbs, for example "From" and "To". They are necessary, because the library has no texts.  |
| `valueText(value, thumb)`       | The text that a screen reader reads for the value of a thumb. Without it, the text is the value in the x format. |
| `thumbSize`                     | The width of the area of a thumb that a pointer can hit, in pixels. The default is 24.                           |
| `class`                         | The class of the `<g>` element of the brush.                                                                     |

The props follow the conventions of the slider of `@human-kit/ui`: a bindable
value, a `controlled*` prop, `onChange` and `onChangeEnd`.

The type of `range` is `[ChartValue, ChartValue]`. A child component cannot
get the generic type of its root in Svelte 5 (RFC 0001, open question 2).
Thus the type of the range is not the type of the x field. A `bind:range` on
a `[Date, Date]` state, as in the anatomy, can then be a type error. The
prototype checks it, and the candidate is a generic type parameter on the
part.

### Steps

A thumb moves from one x value of the data to the next. The values are the
distinct x values of all of the marks, in the order of the x scale. On a band
scale, the values are the categories. On a linear or a time scale, they are
the numbers or the dates, in ascending order.

Thus the ends of the range are always values of the data, and a band scale
and a continuous scale use the same model. A line in the detail chart starts
and ends at the edges of its plot, because the domain of the detail chart is
the range. The detail chart does not need a clip path.

The two thumbs do not cross. The start thumb stays at least one value before
the end thumb, thus the range always has two values or more.

### Elements

`Chart.Brush` goes in `Chart.Plot`, after the marks. It makes:

- A `<g role="group">` with the name of the brush. It holds all of the
  elements below.
- A `<rect>` that covers the plot, for the pointer. It has no fill and
  `pointer-events="all"`, thus it catches the pointer with no color.
- A `<rect data-brush-selection>` from the start to the end of the range.
- One `<g data-brush-thumb="start">` and one `<g data-brush-thumb="end">`. Each
  has a `<rect>` for the pointer, with the width of `thumbSize`, and a
  `<foreignObject>` with a native `<input type="range">`.

The native inputs are the keyboard targets. They are visually hidden, as the
inputs of the slider of `@human-kit/ui`. CSS draws the thumbs from the data
attributes. The inputs do not get the pointer: the brush controls all of the
pointer gestures.

| Attribute              | Element                 | Description                                        |
| ---------------------- | ----------------------- | -------------------------------------------------- |
| `data-brush`           | The group               | Identifies the brush.                              |
| `data-dragging`        | The group, a thumb      | A pointer drag is in progress.                     |
| `data-focus-within`    | The group               | A thumb has the focus.                             |
| `data-focused`         | A thumb                 | The input of the thumb has the focus.              |
| `data-focus-visible`   | A thumb                 | The input has the focus from the keyboard.         |
| `data-full`            | The group               | The range has all of the values: there is no zoom. |
| `data-brush-thumb`     | A thumb                 | `start` or `end`.                                  |
| `data-brush-selection` | The selection rectangle | The area of the range.                             |

## Accessibility

### Structure

The brush is a group with two sliders, as in the multi-thumb slider of the
WAI-ARIA APG. The group has the name from `aria-label`, and each slider has
the name from `startLabel` or `endLabel`.

The value of each input is the index of its x value in the list of steps. The
input has `min`, `max` and `step="1"`, and `aria-valuetext` with the value in
the format of the chart. Thus a screen reader reads "To, slider, December
2020" and not "To, slider, 47".

The range of each thumb follows the other thumb, as the APG pattern shows. The
`max` of the start input is one step before the end thumb. The `min` of the
end input is one step after the start thumb. Thus `Home` and `End` move a
thumb to the limit that it can get to.

A native input, and not an element with `role="slider"`, is the
recommendation of open question 2. A screen reader on a phone changes a native
slider with a swipe. With `role="slider"` on another element, the swipe sends
no key event, and the user cannot change the value.

### Keyboard

The brush adds two tab stops after the tab stop of the points. The order is
the order of the elements: the points of the chart, the start thumb, then the
end thumb.

| Key                      | Action                                                                      |
| ------------------------ | --------------------------------------------------------------------------- |
| `ArrowRight`, `ArrowUp`  | Moves the thumb to the next x value.                                        |
| `ArrowLeft`, `ArrowDown` | Moves the thumb to the previous x value.                                    |
| `PageUp`, `PageDown`     | Moves the thumb a larger step. The browser sets the step of a native input. |
| `Home`                   | Moves the thumb to its lowest limit.                                        |
| `End`                    | Moves the thumb to its highest limit.                                       |

The browser controls these keys, because the thumbs are native inputs. The
brush does not add a key handler. The prototype measures the `PageUp` step of
each browser. If it is not ten values or near one tenth of the values, the
brush sets it.

There is no key to reset the range. The application adds a button, as the
anatomy shows. A button has a name, and the user can find it. A key on a
thumb has no name, and a user must read the documentation to find it.

A thumb with the focus does not move the focus of the points. The point that
had the focus keeps the tab stop, thus `Shift+Tab` goes back to it.

### Pointer

| Gesture                       | Result                                                                   |
| ----------------------------- | ------------------------------------------------------------------------ |
| A drag on a thumb             | Moves that thumb.                                                        |
| A drag in the selection       | Moves the whole range. The number of values in the range stays the same. |
| A drag out of the selection   | Makes a new range from the start to the end of the drag.                 |
| A click or a tap with no drag | Moves the nearest thumb to the x value at the pointer.                   |

All of the positions go to the nearest x value of the data. A movement of
less than 4 pixels is a click and not a drag. The click gesture gives a single
pointer the same result as a drag, as WCAG 2.5.7 asks.

During a drag, the brush captures the pointer. The brush stops the
propagation of its `pointerdown`, `pointermove` and `click` events. Thus the
tooltip does not follow the pointer during a drag, and a click on the brush
does not select a point. Out of a drag, the tooltip opens on the point under
the pointer, as before.

On a touch screen, the pointer area has `touch-action: pan-y`. A vertical
swipe scrolls the page, and a horizontal drag goes to the brush. The area of a
thumb is at least 24 pixels wide, as WCAG 2.5.8 asks. The documentation tells
an application to give a larger `thumbSize` for a touch screen.

### Screen reader

When a thumb moves, the screen reader reads its new value, because the value
of the input changes. The brush makes no live region, as RFC 0001 decided for
the root.

The detail chart changes when the range changes. It does not take the focus,
and it does not speak. A user who goes to the detail chart reads the points
in the range, and its data table has only the rows in the range. The data
table of the overview keeps all of the rows.

An application that wants to say more, for example the number of rows in the
range, gives a `valueText` function. The library does not make that text,
because it has no texts of its own.

### Other requirements

- In `forced-colors` mode, the selection has a `Highlight` stroke, and the
  thumbs use `CanvasText`. The documentation gives the CSS.
- The focus ring of a thumb is on the `<g>` of the thumb, from
  `data-focus-visible`, because the input is hidden.
- A thumb on the server has its position from the scale, thus the server
  makes the same markup as the client.

## Zoom

The recommendation of open question 3 is a pair of charts: an overview with
the brush, and a detail chart. The application filters the rows of the detail
chart, as the anatomy shows. The root does not change.

The domain of the detail chart comes from its rows. The ends of the range are
x values of the data, thus the domain is the range, without a `domain` prop.

The filter is in the application, and not in the root, for these reasons:

- A root that zooms must also remove the points out of its domain from the
  keyboard, from the names and from the data table. Without that, a user can
  focus a point that is not on the screen. That code goes into each chart,
  also into a chart without a brush.
- The rows are the data of the application. RFC 0001 puts data cleanup and
  aggregation in the application.

The documentation gives the filter for each scale type. For a band scale, the
filter uses the order of the categories:
`data.slice(data.findIndex(...), ...)`.

## Changes to the existing parts

| Part         | Change                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------- |
| `Chart.Root` | A focus on an element in the plot that is not a point clears `focused` and the focus state. |

Today the plot does not clear the focus of a point when the focus goes to
another element in the plot. The `focusout` handler sees that the new element
is in the plot, and it keeps the state. With a brush, the point then keeps
`data-focused`, and the tooltip stays open on it. The fix is in the
`focusin` handler of the root.

## Size

A chart that does not use `Chart.Brush` gets only the change in the root.
That change must be smaller than 0.05 kB gzip, or this RFC changes.

The brush has its own subpath. Most of its code is for the pointer: four
gestures, the click test, the capture and the snap to the nearest value. The
keyboard code is small, because the native inputs control the keys. The
prototype measures the size of the part, and the PR gives it.

A new fixture, "an overview with a brush and a detail chart", goes into
`pnpm size`.

## Tests

- Unit tests for the steps on a band scale, a linear scale and a time scale.
  Also two marks with different x values, and a value that is not in the data.
- Unit tests for the limits: the thumbs do not cross, and a range has two
  values or more.
- Browser tests for each key in the keyboard table, with real key presses on
  the native inputs. The tests also check `min`, `max` and `aria-valuetext`
  after each key.
- Browser tests for each gesture in the pointer table, also the click with
  no drag.
- A browser test: the tooltip does not move during a drag, and a click on the
  brush does not select a point.
- A browser test: a focus on a thumb clears the focus state of the point.
- A server test: the same markup on the server and on the client.
- An accessibility tree test: the group with its name, two sliders with their
  names, and the value texts.

### Manual NVDA test

The test uses NVDA with Chrome on Windows, with real key presses on the
anatomy demo, as in RFC 0001. The overview has twelve months, from January to
December 2020.

| Step | Key          | Expected result                                                          |
| ---- | ------------ | ------------------------------------------------------------------------ |
| 1    | `Tab`        | The focus goes to the first point of the overview. NVDA reads the point. |
| 2    | `Tab`        | NVDA reads the group name, "From", "slider" and "January 2020".          |
| 3    | `ArrowRight` | NVDA reads "February 2020". The detail chart starts at February.         |
| 4    | `End`        | NVDA reads "November 2020", one value before the end thumb.              |
| 5    | `Home`       | NVDA reads "January 2020".                                               |
| 6    | `Tab`        | NVDA reads "To", "slider" and "December 2020".                           |
| 7    | `ArrowLeft`  | NVDA reads "November 2020". The detail chart ends at November.           |
| 8    | `Tab`        | The focus goes to the button. NVDA reads "Show all months, button".      |
| 9    | `Enter`      | The range has all of the values again.                                   |
| 10   | `Shift+Tab`  | The focus goes back to the end thumb. NVDA reads "December 2020".        |
| 11   | `Tab` twice  | The focus goes to the first point of the detail chart, in the range.     |

The test also checks that NVDA stays in focus mode on the thumbs. The plot has
`role="application"`, and the inputs are in it.

A second check uses TalkBack with Chrome on Android. A swipe up or down on a
thumb must change its value. This check is the reason for the native inputs,
thus it is part of the acceptance test of this RFC.

## Prototype plan

1. A spike: a native input in a `<foreignObject>` in the plot. Check the
   focus, the tab order and the position in Chrome, Firefox and Safari. Check
   NVDA and TalkBack. If the spike fails, use open question 2, candidate b.
2. The fix of the focus state in the root. Measure its size.
3. `Chart.Brush` with the keyboard only: the steps, `bind:range`, the limits
   and the value texts.
4. The overview and detail demo on the docs site, with the filter.
5. The pointer: a drag on a thumb, then a new range, then a drag of the
   range, then the click.
6. The touch screen: `touch-action` and the size of a thumb.
7. Measure the size of each step.
8. The NVDA test and the TalkBack check.

## Open questions

1. **The shape of the part.** Recommended: a `Chart.Brush` part in
   `Chart.Plot`, with two thumbs, and `bind:range` in data values. The
   candidates are (a) a `brush` prop on `Chart.Root`, and (b) one control
   with one value for the whole range. With (a), each chart includes the
   brush code, also a chart without a brush. With (b), the screen reader
   cannot read the two ends apart, and the APG has no pattern for it. The name
   of the prop is also open: `range`, or `value` as on the slider of
   `@human-kit/ui`. `range` tells what the value is in a chart.
2. **The element of a thumb.** Recommended: a native `<input type="range">`
   in a `<foreignObject>`. Candidate b is an SVG element with
   `role="slider"` and a key handler in the brush. Candidate c is an HTML layer
   next to the plot, as the tooltip. Candidate b is the APG example, but a screen
   reader on a phone cannot change its value. Candidate c has no position on
   the server, and it must measure the plot after the mount. The spike of step
   1 decides between the recommendation and candidate b.
3. **The zoom.** Recommended: an overview chart with the brush, and a detail
   chart with the rows that the application filters. The root does not
   change. Candidate b is a prop on `Chart.Root` that sets the x domain
   and removes the points out of it. Candidate c is zoom in place: the brush
   changes the domain of its own chart at the end of a drag. Candidate b
   adds code to each chart. Candidate c needs b, a way back, and a brush that
   is empty after each zoom.
4. **The steps of a thumb.** Recommended: the distinct x values of the data,
   for all scale types. The candidate is a free value on a continuous scale,
   with a `step` prop. A free value gives ends that are not in the data. Then
   the line of the detail chart does not get to the edge of the plot. Also, the
   value text is a value that the user cannot find in the data table.
5. **A key that moves the whole range.** Recommended: not in the first
   version. The user moves the two thumbs, with the same result. The
   candidates are (b) a third slider for the position of the range, and (c)
   `Shift` and an arrow key on a thumb. Candidate b adds a third tab stop, and
   its value is two values. Candidate c is not in the APG, and a user cannot
   find it.
6. **The reset.** Recommended: a button in the application, which sets
   `range` to `undefined`. The candidates are (b) `Escape` on a thumb, and
   (c) a double click on the plot. `Escape` already closes the tooltip, and a
   dialog around the chart can use it. A double click has no keyboard
   equivalent.
7. **A click with no drag.** Recommended: it moves the nearest thumb to the
   pointer. The candidate is a click that clears the range. A clear makes a
   new range impossible without a drag, and WCAG 2.5.7 asks for a single
   pointer result.
8. **The tooltip and the selection of points.** Recommended: the brush stops
   the propagation of its pointer events during a gesture, and the
   documentation puts the brush in an overview without a tooltip. The
   candidate is a brush in a strip under the x axis, and not on all of the
   plot. A strip has no conflict with the points, but it is a smaller target.
9. **What the screen reader reads after a change.** Recommended: only the new
   value of the thumb, with `valueText` for more. The detail chart and its data
   table follow the range, and they do not speak. The candidate is a live
   region that reads the range or the number of rows. RFC 0001 has no live
   region, and a live region and the value of the slider then speak at the
   same time.
10. **The names of the thumbs.** Recommended: `startLabel` and `endLabel` are
    necessary props. A missing name is a type error, and it adds no bytes. The
    candidate is a default name, for example "Start". The library has no texts,
    and a default text is in one language only.
11. **The points of the overview.** Recommended: the overview keeps its points
    and its tab stop in the first version. The candidate is a prop that removes
    the points of a chart from the tab order and from the accessibility tree.
    The NVDA test shows if the extra tab stop is a problem. That prop adds
    bytes to the root.
12. **The scope of the first version.** Recommended: an x range on a band, a
    linear or a time scale, on a chart with vertical marks. The candidates are
    a y range, a range on two axes, and zoom in place. Each candidate is a
    later RFC.
