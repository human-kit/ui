---
title: DatePicker
description: A composable date picker pairing a segmented date input with a calendar popover, with locale-aware formatting and no-auto-correct validation.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Bounds from './demos/bounds.svelte';
	import boundsSource from './demos/bounds.svelte?highlight';
	import api from './api.json';
</script>

# DatePicker

This is a date picker that you assemble from parts. It puts a date input with segments together with a calendar in a popover. The user selects a date in the format `YYYY-MM-DD`.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`DatePicker.Root` holds the value and the open state. `DatePicker.Input` makes the segments for the locale. `DatePicker.Trigger` opens the popover. `DatePicker.Popover` contains a full calendar, and that calendar uses the same parts as the standalone `Calendar`.

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

## Minimum and maximum

The `minValue` and `maxValue` props set the limits for the calendar and for the text that the user types. The component never corrects a date that is out of the limits. The input gets `aria-invalid` and `data-invalid`, and the value stays `null`. Thus the user sees the exact text that the user typed.

<Demo source={boundsSource}><Bounds /></Demo>

## Usage guidelines

- When your own code controls the state, use `value` with `onChange`. When the component controls the state, use `defaultValue`. The empty state is `null`.
- Use `open`, `defaultOpen`, and `onOpenChange` to control the popover. Use `closeOnSelect` to keep the popover open after a selection.
- The `isDateUnavailable` prop makes specified days unavailable in the input and in the calendar.
- `DatePicker.Popover` accepts the props of `Popover.Content`, for example `placement` (the default is `bottom-start`), `offset`, and `shouldFlip`.
- `DatePicker.Calendar` accepts the props of `Calendar.Root`. It does not accept the props that the root controls, for example `value`, `selectionMode`, and `disabled`.
- Put the picker in a `LocaleProvider` to localize the sequence of the segments, the placeholders, and the names in the calendar.

## Accessibility

- The accessible name of each segment comes from the active locale.
- `DatePicker.Input` gets `aria-invalid` and `data-invalid` when the segments do not make a valid date. The component shows the text of the user, and it never corrects the text.
- A disabled date in the calendar keeps the focus. Thus a screen reader can find it and announce it as disabled.
- When the popover opens, the focus goes to the day cell of the current date. If the user closes the popover with the keyboard, the focus goes back to the trigger.
- In the read-only mode, the calendar trigger is not in the DOM.

## API reference

<ApiReference api={api} />
