---
title: DateRangePicker
description: A composable date range picker pairing two segmented date inputs with a range calendar popover.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Bounds from './demos/bounds.svelte';
	import boundsSource from './demos/bounds.svelte?highlight';
	import api from './api.json';
</script>

# DateRangePicker

This is a date range picker that you assemble from parts. It puts two date inputs with segments — one for the start and one for the end — together with a range calendar in a popover. The value is a `{ start, end }` pair of `YYYY-MM-DD` strings. While the range is empty or incomplete, the value is `null`.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`DateRangePicker.Root` holds the range value and the open state. Two `DateRangePicker.Input` parts make the segments for the locale: one has `part="start"` and one has `part="end"`. `DateRangePicker.Popover` contains a calendar in the range mode, and that calendar uses the same parts as the standalone `Calendar`.

```svelte
<script>
	import { DateRangePicker } from '@human-kit/ui/daterangepicker';
</script>

<DateRangePicker.Root>
	<DateRangePicker.Input part="start" aria-label="Start date">
		{#snippet children(segment)}
			<DateRangePicker.Segment part="start" {segment} />
		{/snippet}
	</DateRangePicker.Input>
	<DateRangePicker.Input part="end" aria-label="End date">
		{#snippet children(segment)}
			<DateRangePicker.Segment part="end" {segment} />
		{/snippet}
	</DateRangePicker.Input>
	<DateRangePicker.Trigger />

	<DateRangePicker.Popover>
		<DateRangePicker.Calendar>
			<div>
				<DateRangePicker.TriggerPrevious />
				<DateRangePicker.Heading />
				<DateRangePicker.TriggerNext />
			</div>
			<DateRangePicker.Grid>
				<DateRangePicker.GridHeader />
				<DateRangePicker.GridBody />
			</DateRangePicker.Grid>
		</DateRangePicker.Calendar>
	</DateRangePicker.Popover>
</DateRangePicker.Root>
```

## Minimum and maximum

The `minValue` and `maxValue` props set the limits for the calendar and for the text that the user types. If you give no `children` snippet, `DateRangePicker.Input` makes its segments with the default styles. This demo shows that.

<Demo source={boundsSource}><Bounds /></Demo>

## Usage guidelines

- When your own code controls the state, use `value` with `onChange`. When the component controls the state, use `defaultValue`. The value is a `{ start, end }` pair, and the empty state is `null`.
- Always make one input with `part="start"` and one input with `part="end"`. Give the same `part` value to their segments.
- Use `open`, `defaultOpen`, and `onOpenChange` to control the popover. Use `closeOnSelect` to keep the popover open after the range is complete.
- The `isDateUnavailable` prop makes specified days unavailable in the inputs and in the calendar.
- Set `visibleMonths` on `DateRangePicker.Calendar` to show more than one month. More than one month makes the range selection easier.
- Put the picker in a `LocaleProvider` to localize the sequence of the segments, the placeholders, and the names in the calendar.

## Accessibility

- Give each input its own accessible name, for example `aria-label="Start date"` and `aria-label="End date"`.
- The accessible name of each segment comes from the active locale.
- Each input gets `aria-invalid` and `data-invalid` when its segments do not make a valid date. The component shows the text of the user, and it never corrects the text.
- A disabled date in the calendar keeps the focus. Thus a screen reader can find it and announce it as disabled.
- In the range calendar, the first selection starts the range. The arrow keys make the range longer or shorter. The `Enter` key and the `Space` key complete the range.

## API reference

<ApiReference api={api} />
