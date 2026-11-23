---
title: Chart.Tooltip
description: Chart.Tooltip shows the values of the hovered or keyboard-focused point of a Svelte chart, without a second announcement for screen readers.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Custom from './demos/custom.svelte';
	import customSource from './demos/custom.svelte?highlight';
	import api from './api.json';
</script>

# Tooltip

`Chart.Tooltip` shows the values of one point in a box near the point. It opens on the point under the pointer, and on the point that has the keyboard focus.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

```svelte
<Chart.Root data={rows} x="day" y="price">
	<Chart.Plot>
		<Chart.Line />
	</Chart.Plot>
	<Chart.Tooltip />
</Chart.Root>
```

The tooltip is HTML, thus it goes in `Chart.Root` and not in `Chart.Plot`. It makes a `<div>` with `position: absolute`. The root is its containing block.

## Open and close

- The pointer opens the tooltip on the nearest point, when the point is less than 40 pixels from the pointer.
- On a touch screen, a tap opens the tooltip on the nearest point. The tooltip stays when the finger lifts. A tap out of the plot closes it, and a finger that scrolls the page also closes it.
- Near an edge of the figure, the tooltip moves away from the point. It stays in the width of the figure, thus it does not make the page wider on a narrow screen.
- The keyboard focus opens the tooltip on the focused point. A focus from a pointer press does not open it.
- `Escape` closes the tooltip. A move to another point opens it again.

`offset` is the distance between the point and the tooltip, in pixels. The tooltip is above the point, and its middle is at the x position of the point.

With `follow`, the tooltip moves along with the pointer, at the height of the point under the pointer. Use it for a large mark, as a long bar, whose position can be far from the pointer. The point that has the keyboard focus keeps its tooltip at the point. A tooltip that follows the pointer stays in the box that would cut it, not in the figure. That box is the nearest ancestor whose `overflow` is not `visible`, or the page. Thus on a figure narrower than the tooltip, the tooltip still goes where the pointer goes.

## Content of your own

Without children, the tooltip shows the category or the x value, then the name of the series and the value. Give `children` to replace this content. The snippet receives the point and its values as text, in the formats of the chart.

<Demo source={customSource}><Custom /></Demo>

`point.datum` is the row. The tooltip does not know the type of your data, thus give the type to the row in the snippet.

## Accessibility

- The tooltip has `aria-hidden="true"`. A screen reader reads the name of the focused point, and the tooltip does not say it a second time.
- The tooltip never contains a control, and it never takes the focus. Do not put a link or a button in it.
- A value is never available only in the tooltip. Put the same information in the name of the points or in the data table.

## Styles

```css
.chart [data-tooltip] {
	padding: 0.25rem 0.5rem;
	border-radius: 4px;
	background: #111827;
	color: white;
	white-space: nowrap;
}
```

| Element             | Attribute             | Value                                |
| ------------------- | --------------------- | ------------------------------------ |
| Box                 | `data-tooltip`        | Empty.                               |
| Box                 | `data-series`         | The name of the series of the point. |
| Line of the x value | `data-tooltip-key`    | Empty.                               |
| Line of the value   | `data-tooltip-value`  | Empty.                               |
| Name of the series  | `data-tooltip-series` | Empty.                               |

The last three attributes are on the default content only.

### Animation

The box has `data-entering` while it opens and `data-exiting` while it closes. It is centred with the `translate` property, thus an animation of `transform` does not move it away from its place. Give them a CSS animation: the box goes after the animation of `data-exiting` ends. Without an animation, it goes at once.

```css
@keyframes tooltip-in {
	from {
		opacity: 0;
	}
}

@keyframes tooltip-out {
	to {
		opacity: 0;
	}
}

.chart [data-tooltip][data-entering] {
	animation: tooltip-in 100ms;
}

.chart [data-tooltip][data-exiting] {
	animation: tooltip-out 80ms;
}
```

## API reference

<ApiReference api={api} />
