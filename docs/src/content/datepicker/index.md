---
title: DatePicker
description: A composable date picker pairing a segmented date input with a calendar popover, with locale-aware formatting and no-auto-correct validation.
---

<script>
	import Demo from '$lib/docs/demo.svelte';
	import ApiReference from '$lib/docs/api-reference.svelte';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Bounds from './demos/bounds.svelte';
	import boundsSource from './demos/bounds.svelte?highlight';
	import api from './api.json';
</script>

# DatePicker

A composable date picker that pairs a segmented date input with a calendar popover for selecting `YYYY-MM-DD` dates.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`DatePicker.Root` owns the value and open state. `DatePicker.Input` renders locale-resolved segments, `DatePicker.Trigger` opens the popover, and `DatePicker.Popover` hosts a full calendar built from the same parts as the standalone `Calendar`.

```svelte
<script>
	import { DatePicker } from '@human-kit/ui/datepicker';
</script>

<DatePicker.Root>
	<DatePicker.Input aria-label="Date input">
		{#snippet children(segment)}
			<DatePicker.Segment {segment} />
		{/snippet}
	</DatePicker.Input>
	<DatePicker.Trigger />

	<DatePicker.Popover>
		<DatePicker.Calendar>
			<div>
				<DatePicker.TriggerPrevious />
				<DatePicker.Heading />
				<DatePicker.TriggerNext />
			</div>
			<DatePicker.Grid>
				<DatePicker.GridHeader />
				<DatePicker.GridBody />
			</DatePicker.Grid>
		</DatePicker.Calendar>
	</DatePicker.Popover>
</DatePicker.Root>
```

## Min and max bounds

`minValue` and `maxValue` constrain both the calendar and typed input. Out-of-range dates are never auto-corrected: the input exposes `aria-invalid` and `data-invalid` while the committed value stays `null`, so users can see exactly what they typed.

<Demo source={boundsSource}><Bounds /></Demo>

## Usage guidelines

- Use `value` with `onChange` for controlled state and `defaultValue` for uncontrolled state; the empty state is `null`.
- Use `open` / `defaultOpen` / `onOpenChange` to control the popover, and `closeOnSelect` to keep it open after selection.
- `isDateUnavailable` marks specific days as non-selectable in both the input and the calendar.
- `DatePicker.Popover` forwards `Popover.Content` props such as `placement` (default `bottom-start`), `offset`, and `shouldFlip`.
- `DatePicker.Calendar` forwards `Calendar.Root` props except those controlled by the root (`value`, `selectionMode`, `disabled`, …).
- Wrap in a `LocaleProvider` to localize segment order, placeholders, and calendar labels.

## Accessibility

- Segment accessible names are resolved automatically from the active locale.
- `DatePicker.Input` exposes `aria-invalid` and `data-invalid` when the current segment draft is not committable; invalid input is shown, never auto-corrected.
- Disabled calendar dates remain focusable via keyboard navigation so screen readers can discover and announce them as disabled.
- Popover focus defaults to the current active day cell; closing with the keyboard restores visible focus to the trigger.
- In read-only mode, the calendar trigger is hidden.

## API reference

<ApiReference {api} />
