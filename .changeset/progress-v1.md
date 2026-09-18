---
'@human-kit/ui': minor
---

Add the Progress primitive with `Root`, `Label`, `Track`, `Indicator` and `Value`. The root is the `role="progressbar"` element with `aria-valuemin`, `aria-valuemax`, `aria-valuenow` and `aria-valuetext`; `value={null}` makes it indeterminate, with no number for the screen reader. The label names the bar through `aria-labelledby`, the value is `aria-hidden` because the bar already gives it, and the text follows the locale of `LocaleProvider` as a percentage of the range or in a unit through `format`. The indicator fills from the start edge of the text direction, or from the bottom of a vertical track, and `bind:context` gives `percent` and `status` for a shape of your own.
