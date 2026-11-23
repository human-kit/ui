# Chart

## Description

`Chart` is a set of headless chart parts. The parts give you the scales, the geometry, the keyboard operation, the focus control and the accessible names. No part gives you a style.

The charts are a preview. Their API can change in a minor version of the package.

## Anatomy

```svelte
<script lang="ts">
	import { Chart } from '@human-kit/ui';
	import { scaleTime } from '@human-kit/ui/chart/scales/time';
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

| Group  | Parts                                                                           |
| ------ | ------------------------------------------------------------------------------- |
| Root   | `Chart.Root`, `Chart.Title`, `Chart.Plot`                                       |
| Marks  | `Chart.Line`, `Chart.Area`, `Chart.Bar`, `Chart.Dot`, `Chart.Arc`, `Chart.Rule` |
| Guides | `Chart.Axis`, `Chart.Grid`, `Chart.Legend`                                      |
| Access | `Chart.Tooltip`, `Chart.DataTable`                                              |
| Scales | `scaleLinear`, `scaleTime`, `scaleBand` (one subpath for each)                  |

## Rules

- **Accessibility is the primary function.** A chart is one tab stop, and the arrow keys move the focus over the data. Each point has an accessible name with all of its values. `Chart.DataTable` gives the same data as a table.
- **Size is the second function.** The charts add no runtime dependency. Each scale has its own subpath export, and a chart includes only the parts that it imports. `pnpm size:chart` measures the size of a set of fixed charts, and CI runs it on each change.
- **A chart is a composition of marks.** You put a line, an area or bars on shared scales. Each mark can have its own data.

## Design

The design documents are in [`rfcs/`](../../../../../rfcs). Read `0001-architecture.md` before you add a part.

## API

`pnpm docs:api` writes the API tables of the docs pages from the types in `types.ts`. The list of the parts of each page is in `scripts/gen-chart-api.mjs`.
