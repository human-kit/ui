---
'@human-kit/ui': minor
---

Add `Chart`, a set of headless chart parts: `Chart.Root`, `Chart.Title`, `Chart.Plot`, the marks (`Line`, `Area`, `Bar`, `Dot`, `Arc`), the guides (`Axis`, `Grid`, `Legend`), `Chart.Tooltip` and `Chart.DataTable`. A chart is one tab stop, the arrow keys move the focus over the data, and each point has an accessible name. Import the parts from `@human-kit/ui` or `@human-kit/ui/chart`, and the scales from `@human-kit/ui/chart/scales/linear`, `/time` and `/band`.

This code was the package `@human-kit/charts`. That package gets no new versions. To move, change the import of `Chart` to `@human-kit/ui`, and change `@human-kit/charts/scales/` to `@human-kit/ui/chart/scales/`.

The charts are a preview: their API can change in a minor version until a release note tells you that it is stable.
