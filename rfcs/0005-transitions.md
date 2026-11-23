# RFC 0005: Transitions between data

- **Status:** Draft
- **Date:** 2026-10-29
- **Scope:** version 0.6 or later
- **Depends on:** [RFC 0001](0001-architecture.md), [RFC 0002](0002-dot-mark.md), [RFC 0003](0003-arc-mark.md)

## Summary

When the data of a chart changes, the marks jump to the new data. This RFC
adds transitions. With a transition, the marks move from the old data to the
new data in a short time. The eye can then follow each datum
across the update.

A transition is optional. The application imports it from a subpath and gives
it to `Chart.Root`. A chart without a transition does not include its code.
When the user sets `prefers-reduced-motion: reduce`, the chart does not move:
it shows the new data at once.

RFC 0001 put animation out of version 1, with the promise that a transition
obeys `prefers-reduced-motion`. RFC 0001 also promised a `key` channel that
keeps the focus on the same row after a data update. The code does not have it
yet. A transition needs it too, thus this RFC adds it.

## Goals

- A user who can see the chart can follow each datum from the old data to the
  new data.
- A chart that does not import the transition does not include its code.
- With `prefers-reduced-motion: reduce`, nothing on the chart moves.
- The focus stays on the same datum across an update, also during a
  transition.
- A screen reader gets no announcement per frame. The accessible names, the
  tooltip text and the data table show the new values at once, never values
  between the old and the new.
- The server and the first render in the browser draw the final chart, with no
  motion.
- A new update during a transition starts from the shapes on the screen, with
  no jump.

## Non-goals

- Transitions of the axes, the grid lines, the legend and the data table. They
  show the new data at once. See open question 10.
- An enter animation on the first render, for example bars that grow when the
  page opens. The first render is the final chart.
- A transition on a change of size. When the container changes its size, the
  chart draws again at once, as before.
- A sequence of transitions, for example one series after the other, or a
  delay per bar.
- Numbers in the tooltip or in labels that count from the old value to the new
  value.
- A spring or a physics model. The transition has a duration and an easing.

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { tween } from '@human-kit/charts/transition';

	type Sale = { month: Date; revenue: number; region: string };
	let { sales }: { sales: Sale[] } = $props();
</script>

<Chart.Root
	data={sales}
	x="month"
	y="revenue"
	series="region"
	key="month"
	transition={tween({ duration: 300 })}
>
	<Chart.Plot>
		<Chart.Line />
	</Chart.Plot>
</Chart.Root>
```

The `transition` prop follows the pattern of the scales. The root does not
import the transition code. The application imports a function from a subpath
and gives it to the root, as it gives `scaleTime` to `xScale`.

## API

### `Chart.Root`

| Prop         | Description                                                                                     |
| ------------ | ----------------------------------------------------------------------------------------------- |
| `key`        | The channel that identifies a row across updates. The default depends on the mark (see "Keys"). |
| `transition` | The transition of the marks, from `@human-kit/charts/transition`. Without it, the marks jump.   |

A mark with its own `data` can also have its own `key`. The rule is the same
as for `x` and `y` (RFC 0001, open question 2).

### `tween(options)`

`@human-kit/charts/transition` exports one function, `tween`.

| Option     | Description                                                                         |
| ---------- | ----------------------------------------------------------------------------------- |
| `duration` | The duration of a transition, in milliseconds. The default is 300.                  |
| `easing`   | A function from the time (0 to 1) to the progress (0 to 1). The default is a cubic. |

The function returns an object that the root puts in the context. Each mark
reads it from the context. When it is not there, the mark draws the final
shapes, as it does now.

### Geometry, not paths

A mark does not interpolate the text of a `d` attribute. It gives the
transition a list of records. Each record has the key of a datum and a few
numbers on the screen:

| Mark | Numbers of a record                            |
| ---- | ---------------------------------------------- |
| Line | x and y of the point                           |
| Area | x, the y of the top and the y of the bottom    |
| Bar  | x, y, width and height of the rectangle        |
| Dot  | x, y and the size of the symbol                |
| Arc  | the start angle and the end angle of the slice |

The transition interpolates the numbers of each key. The mark then makes the
path of each frame from the numbers, with the same functions that it uses now.
This has three results:

- The point count can change. A path with more points is not a problem,
  because the interpolation does not compare two paths.
- A slice stays on its circle. An interpolation of the `d` text of an arc
  moves its ends on straight lines, and the slice then goes out of the circle.
- The numbers are on the screen, after the scales. When a domain changes, the
  marks move to the new scale too.

### Enter and exit

A key that is only in the new data enters. A key that is only in the old data
exits. Each mark gives the numbers where an entering record starts and where an
exiting record ends:

| Mark | An entering datum starts                        | An exiting datum ends                           |
| ---- | ----------------------------------------------- | ----------------------------------------------- |
| Line | On the old line, at its new x position          | On the new line, at its old x position          |
| Area | On the old area, at its new x position          | On the new area, at its old x position          |
| Bar  | At the baseline, with a height of 0             | At the baseline, with a height of 0             |
| Dot  | At its new position, with a size of 0           | At its old position, with a size of 0           |
| Arc  | With no angle, at the end of the previous slice | With no angle, at the end of the previous slice |

A line that gets a new point at its end thus grows from its old end. The shape
of the line at the start of the transition is the old shape.

A new series of a line or an area shows at once, at its final shape. A series
that goes away is removed at once. A line has no baseline to grow from, and a
fade of a full series costs bytes for a small gain.

A gap in a line changes at the start of the transition.

### Exiting elements

An exiting datum is not in the data, thus it is not a point. During its exit,
its element has `aria-hidden="true"`, no `role`, no `tabindex` and no
`id`. The keyboard and the pointer do not get to it. The mark removes it at
the end of the transition.

### Interruption

A new update during a transition starts a new transition from the numbers on
the screen. Nothing jumps.

## Keys

The focus, the selection and the transition all need to know which datum is
which across an update. The key of a datum is its series and the value of the
`key` channel.

| Mark                 | Default key   |
| -------------------- | ------------- |
| Line, Area, Bar, Arc | The x value   |
| Dot                  | The row index |

On a line, an area, a bar and an arc, each x value is in a series one time
only. Thus the x value identifies a datum. Think of a time series that adds a
month at the end and removes the first month. With the x value as the key, the
points move to the left, and that is correct. With the row index as the key,
each point moves to the value of the next month. The line then changes its
shape.

On a dot mark, two dots can have the same x value, thus the default is the
row index. A scatter plot that changes its data needs a `key`.

Two rows of a series can have the same key. Then a development build writes a
warning, and the mark uses the row index for that series.

The id of the element of a point comes from its key, not from its index. Svelte
then keeps the same element for the same datum. This is also what keeps the
focus.

## Accessibility

### Focus

- The focused point keeps its element across an update. Thus the browser does
  not move the focus, and the screen reader does not read the point again.
- The focused datum can be absent from the new data. Then the focus goes to
  the point at the same index in the same series. When the series has fewer
  points, it goes to its last point. When the series is not there, it goes to the first point of the chart. This
  move occurs at the start of the transition, not at its end.
- The keyboard operates on the new data at once. During a transition,
  `ArrowRight` goes to the next point of the new data.
- The selection follows the key, as the focus does. RFC 0001 compares the row
  index and the series. This RFC compares the key and the series.

### Screen readers

- A transition changes only geometry attributes: `d`, `cx`, `cy`, `x`, `y`,
  `width`, `height` and `transform`. A screen reader does not read them.
- The accessible name of a point comes from the data, not from the numbers of
  a frame. It changes one time per update, at the start, as it does now.
- The library makes no live region, as in RFC 0001.

### Tooltip

- The text of the tooltip shows the new values at once.
- The position of the tooltip follows the element on the screen. The anchor of
  a mark reads the numbers of the current frame, thus the tooltip and its
  point move together.
- The pointer test of the root uses the same anchor. Under the pointer is the
  point that the eye sees there.

### Motion

- With `prefers-reduced-motion: reduce`, a transition has a duration of 0. The
  chart shows the new data at once, with no fade.
- The transition reads the media query at the start of each transition. A
  change of the setting applies to the next update, and no listener is
  necessary.
- The application cannot make a chart move when the user set `reduce`.
- A chart that gets new data each second moves without a stop. WCAG 2.2.2
  then asks for a control that stops the motion, when the motion is longer than
  five seconds. The documentation tells the application to give that control,
  or to not use a transition on such a chart.

### Server and first render

- The server draws the final chart. The transition has no state on the server.
- The first render in the browser draws the final chart. The transition keeps
  the numbers of the first render as its start, and it does not request a frame.
- Only a change of the data, of a channel or of a domain starts a transition.
  A change of the width, the height or the margin draws the chart again at
  once. Thus the first measure after the hydration does not move the chart.
- When the page is hidden, the browser stops the frames. The transition then
  goes to its end.

## Changes to the existing parts

| Part         | Change                                                                                 |
| ------------ | -------------------------------------------------------------------------------------- |
| `Chart.Root` | The `key` and `transition` props. The ids of the points and the selection use the key. |
| Marks        | Each mark gives its records to the transition, when the context has one.               |
| Marks        | Each mark draws the exiting elements with `aria-hidden="true"`.                        |
| `anchor`     | It reads the numbers of the current frame.                                             |

## Size

Two rules:

1. The code of `tween` is only in a chart that imports it.
2. A chart without a transition gets only the `key` channel and a hook in each
   mark. The `key` channel corrects the focus, which RFC 0001 promised. Its
   budget is 0.1 kB gzip. The hook of each mark has a budget of 0.05 kB gzip.
   If a mark needs more, this RFC changes.

The sizes from `pnpm size` before this RFC, gzip, without the Svelte runtime:

| Chart                                                     | Size     |
| --------------------------------------------------------- | -------- |
| A line with the keyboard operation                        | 5.65 kB  |
| Stacked bars on a band scale, axes and grid               | 8.61 kB  |
| A line on a time scale, two axes and a grid               | 7.86 kB  |
| Stacked areas, axes, grid, legend, tooltip and data table | 11.26 kB |
| A scatter plot with two axes, a grid and a legend         | 7.80 kB  |
| A donut with a legend and a data table                    | 8.42 kB  |

The estimate for `tween` is 0.6 kB to 0.9 kB gzip. It holds a frame loop, the
easing, the match of the keys, and the enter and exit records. The prototype measures
it. A new fixture, "a line with a transition", goes into `pnpm size`. Its
budget is the line fixture plus 1 kB.

## Tests

- Unit tests for `tween`: the match of the keys, and the start numbers of an
  entering record. Also the end numbers of an exiting record, and an
  interruption that starts from the current numbers.
- A unit test for each mark: the records of the old data and of the new data,
  with a point count that changes.
- A unit test for the media query: with `reduce`, a transition has no frame
  between the old numbers and the new numbers.
- A unit test for a change of size: no transition.
- Browser tests for the focus. An update that sorts the rows again keeps the
  focus on the same datum. An update that removes the focused datum moves the
  focus to the expected point.
- A browser test that counts the changes of the `aria-label` of the focused
  point during a transition. The count is one at most.
- A browser test for the exiting elements: `aria-hidden`, no `role` and no
  `tabindex`.
- A browser test for the tooltip: its text shows the new values on the first
  frame, and its position follows the point.
- A browser test that emulates `prefers-reduced-motion: reduce` and checks
  that the final shapes are on the screen after the update, with no frame.
- A server test: the same markup on the server and on the client, and no frame
  request after the hydration.
- A manual test with NVDA and Chrome before the minor version, with real key
  presses. The test puts the focus on a point, then updates the data. NVDA must not
  read the point again when its value does not change.

## Prototype plan

1. The `key` channel in the root, the ids of the points from the key, and the
   focus tests. This step can be a pull request of its own.
2. Measure the size of step 1.
3. `tween` with the line mark: records, keys, enter and exit.
4. The bar mark and the dot mark.
5. The area mark, also stacked.
6. The arc mark, with the angles.
7. The media query, the change of size, and the first render.
8. Measure the size of each step, and the time of a frame with 5,000 points.
9. The NVDA test.

## Open questions

1. **Opt-in or default, and where.** Recommended: opt-in, with a `transition`
   prop on `Chart.Root` that takes a function from a subpath. The function
   follows the pattern of the scales, and a chart without it does not include
   the code. The candidates:
   - A transition by default in each mark. Each chart gets larger, also a
     chart with static data. The size rule rejects it.
   - A boolean prop on each mark. The code of the transition is then in each
     mark that the application imports, also when the prop is false.
   - A prop on the root that takes a function (recommended). The cost is the
     hook in each mark, at most 0.05 kB.
2. **CSS or a script.** Recommended: a script in the subpath, with
   interpolated numbers. The candidates:
   - CSS transitions on the attributes. They cost no bytes of script. But not
     all browsers transition the `d` property. A `d` with a different command
     count jumps, thus a line that gets a point jumps. A slice goes out of its
     circle. A CSS rule cannot stop a script, and keys are not possible.
   - A script (recommended). It adds 0.6 kB to 0.9 kB gzip to a chart that
     uses it, and nothing to the other charts. It works on all marks and all
     point counts.
   - The documentation can still show a CSS rule for bars and dots, as a
     recipe with no bytes. It is not a part of the library contract.
3. **Reduced motion: what the chart does.** Recommended: no motion at all. The
   chart shows the new data at once. The candidates:
   - No motion (recommended). It costs nothing.
   - A fade from the old chart to the new chart. A fade is not motion, but it
     draws two charts at the same time, and two sets of points confuse the
     focus and the pointer.
   - A shorter duration. It is still motion.
4. **Reduced motion: who checks it.** Recommended: the library, in `tween`. It
   reads `matchMedia` at the start of each transition. The candidates:
   - A CSS media query. It works only for CSS transitions, and it cannot stop
     a script.
   - The application. Each application must then remember it, and the promise
     of RFC 0001 is on the library.
   - The library (recommended). The cost is a few bytes, and only in `tween`.
5. **Keys.** Recommended: a `key` channel on the root and on a mark with its
   own data. The default is the x value on a line, an area, a bar and an arc,
   and the row index on a dot mark. The candidates:
   - The row index for all of the marks. It is the rule of RFC 0001 now. A
     time series that moves by one month changes the shape of its line during
     the transition, and the focus goes to another month.
   - The x value for all of the marks. On a dot mark, two dots can have the
     same x value.
   - A default for each mark (recommended).
6. **Interpolation when the point count changes.** Recommended: interpolate
   the numbers of each key, not the path text, with the enter and exit table of
   this RFC. The candidates:
   - Interpolate the `d` text. Two paths with a different command count need
     extra points, and a slice goes out of its circle.
   - Interpolate the numbers of each key (recommended).
   - For enter and exit, a fade. It costs bytes for each mark, and an
     entering bar that grows from its baseline gives more information.
7. **The focus when the focused datum goes away.** Recommended: the point at
   the same index in the same series, at the start of the transition. The
   candidates:
   - The plot itself. A screen reader then reads the chart and not a datum.
   - The nearest point on the screen. It changes during the transition.
   - The point at the same index (recommended). It is stable and easy to
     predict.
8. **The tooltip during a transition.** Recommended: the text shows the new
   values at once, and the position follows the point on the screen. The
   candidates:
   - Close the tooltip during the transition. A keyboard user then loses it on
     each update.
   - Put it at the final position at once. It then points to empty space until
     the point arrives.
   - Follow the point (recommended). The anchor reads the frame, thus it adds
     no code to the tooltip.
9. **What starts a transition.** Recommended: only a change of the data, of a
   channel or of a domain after the first render. A change of size draws the
   chart again at once. The candidates:
   - All changes, also the size. The first measure after the hydration then
     moves the chart, and a window that changes its size moves all of the
     marks.
   - Only data, channels and domains (recommended).
10. **The axes and the grid.** Recommended: they show the new ticks at once in
    this RFC, and a later RFC adds their transition. During a transition, the
    marks then move on a new axis for 300 milliseconds. The candidates:
    - The same transition on the ticks. It needs keys for the ticks, and enter
      and exit for them, in each chart with axes.
    - No transition on the guides (recommended). It is smaller, and the marks
      arrive at the correct position on the new axis.
