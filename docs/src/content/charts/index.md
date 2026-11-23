---
title: Charts
description: Headless, accessible chart components for Svelte 5, from the same kit. Keyboard operation, accessible names and a data table for each chart.
---

<script>
	import { InstallCommand } from '$lib/docs/components/index.js';
</script>

# Charts

The charts are a part of human-kit ui. They obey the same rules as the components: they give you the behavior, and you write the styles. The parts give you the scales, the geometry, the keyboard operation, the focus control and the accessible names.

The charts are in their own package, `@human-kit/charts`, until version 1.0. The API can change before that version.

## Installation

<InstallCommand pkg="@human-kit/charts" />

Svelte 5 is a peer dependency. The package has no runtime dependency, and each scale has a subpath export. Thus your bundler includes only the parts that you import.

## A chart is a set of parts

Each part is in the `Chart` namespace, as the parts of a component are:

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/charts';
	import { scaleTime } from '@human-kit/charts/scales/time';

	type Sale = { month: Date; region: string; revenue: number };
	let { sales }: { sales: Sale[] } = $props();
</script>

<Chart.Root data={sales} x="month" y="revenue" series="region" xScale={{ type: scaleTime }}>
	<Chart.Title>Revenue per month</Chart.Title>
	<Chart.Plot>
		<Chart.Grid />
		<Chart.Axis position="bottom" />
		<Chart.Axis position="left" label="Revenue (USD)" />
		<Chart.Line />
	</Chart.Plot>
	<Chart.Legend />
	<Chart.Tooltip />
	<Chart.DataTable />
</Chart.Root>
```

This code makes a `<figure>` with an `<svg>` in it. The code adds no styles. Each part shows its state in `data-*` attributes, for example `data-series`, `data-focused` and `data-selected`.

## Accessibility

- A chart is one tab stop. The arrow keys move the focus from one point to the next point.
- Each point has an accessible name with all of its values.
- `Chart.DataTable` gives the same data as a table.

## The parts

| Group  | Parts                                                             |
| ------ | ----------------------------------------------------------------- |
| Root   | `Chart.Root`, `Chart.Title`, `Chart.Plot`                         |
| Marks  | `Chart.Line`, `Chart.Area`, `Chart.Bar`, `Chart.Dot`, `Chart.Arc` |
| Guides | `Chart.Axis`, `Chart.Grid`, `Chart.Legend`                        |
| Access | `Chart.Tooltip`, `Chart.DataTable`                                |
| Scales | `scaleLinear`, `scaleTime`, `scaleBand`                           |

## The full documentation

The live demos and the API reference of each part are on [charts.human-kit.com](https://charts.human-kit.com):

- [Quick Start](https://charts.human-kit.com/docs/quick-start) makes your first chart.
- [Accessibility](https://charts.human-kit.com/docs/accessibility) gives the keyboard operation and the names that a screen reader reads.
- [Line](https://charts.human-kit.com/docs/line), [Area](https://charts.human-kit.com/docs/area), [Bar](https://charts.human-kit.com/docs/bar), [Dot](https://charts.human-kit.com/docs/dot) and [Arc](https://charts.human-kit.com/docs/arc) are the marks.
- [Scales](https://charts.human-kit.com/docs/scales) gives the scale of each data type.
