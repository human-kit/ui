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

A composable date range picker that pairs two segmented date inputs — start and end — with a popover hosting a range calendar. The committed value is a `{ start, end }` pair of `YYYY-MM-DD` strings, or `null` while the range is empty or incomplete.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`DateRangePicker.Root` owns the range value and open state. Two `DateRangePicker.Input` parts — one with `part="start"`, one with `part="end"` — render locale-resolved segments, and `DateRangePicker.Popover` hosts a calendar fixed to range selection built from the same parts as the standalone `Calendar`.

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

## Min and max bounds

`minValue` and `maxValue` constrain both the calendar and the typed inputs. When the `children` snippet is omitted, `DateRangePicker.Input` renders its segments with default styling, as this demo shows.

<Demo source={boundsSource}><Bounds /></Demo>

## Usage guidelines

- Use `value` with `onChange` for controlled state and `defaultValue` for uncontrolled state; the value is a `{ start, end }` pair and the empty state is `null`.
- Always render one input with `part="start"` and one with `part="end"`, and pass the same `part` to their segments.
- Use `open` / `defaultOpen` / `onOpenChange` to control the popover, and `closeOnSelect` to keep it open after the range is confirmed.
- `isDateUnavailable` marks specific days as non-selectable in both the inputs and the calendar.
- Set `visibleMonths` on `DateRangePicker.Calendar` to show more than one month, which makes range selection easier.
- Wrap in a `LocaleProvider` to localize segment order, placeholders, and calendar labels.

## Accessibility

- Give each input its own accessible name (for example `aria-label="Start date"` and `aria-label="End date"`).
- Segment accessible names are resolved automatically from the active locale.
- Each input exposes `aria-invalid` and `data-invalid` when its segment draft is not committable; invalid input is shown, never auto-corrected.
- Disabled calendar dates remain focusable via keyboard navigation so screen readers can discover and announce them as disabled.
- In the range calendar, the first selection starts the range, arrow keys extend the preview, and `Enter` or `Space` confirms it.

## API reference

<ApiReference api={api} />
