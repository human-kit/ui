---
title: Calendar
description: A composable calendar with single-date and range selection, keyboard grid navigation, unavailable dates, and locale-aware rendering.
---

<script>
	import { Demo, ApiReference } from '$lib/docs/components/index.js';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Range from './demos/range.svelte';
	import rangeSource from './demos/range.svelte?highlight';
	import Locale from './demos/locale.svelte';
	import localeSource from './demos/locale.svelte?highlight';
	import api from './api.json';
</script>

# Calendar

This is a calendar that you assemble from parts. The user can select one date or a range of dates, in the ISO format `YYYY-MM-DD`. The keyboard operates the grid. You can control the state, or you can let the component control it.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Calendar.Root` is the container with the state. The triggers and the heading move the calendar from one month to the next month. `Calendar.Grid` makes one month as an accessible grid of header cells and body cells.

```svelte
<script>
	import { Calendar, LocaleProvider } from '@human-kit/ui';
</script>

<LocaleProvider locale="es-ES">
	<Calendar.Root>
		<Calendar.TriggerPrevious />
		<Calendar.Heading />
		<Calendar.TriggerNext />
		<Calendar.Grid weekdayStyle="narrow">
			<Calendar.GridHeader />
			<Calendar.GridBody />
		</Calendar.Grid>
	</Calendar.Root>
</LocaleProvider>
```

## Range selection

Set `selectionMode="range"` to select a `{ start, end }` pair. The first click starts the range. While the pointer moves, the calendar shows the range. The second click completes the range. If the user selects the two dates in the opposite sequence, the component corrects them. The `isDateUnavailable` prop makes specified days unavailable — in this example, the weekend days.

<Demo source={rangeSource}><Range /></Demo>

## Locale

Put the calendar in a `LocaleProvider` to localize the month heading, the weekday names, and the first day of the week. Use `firstDayOfWeek` on `Calendar.Root` to replace the default of the locale. Use `weekdayStyle` on `Calendar.Grid` to select narrow, short, or long weekday names.

<Demo source={localeSource}><Locale /></Demo>

## Usage guidelines

- Use `Calendar.Root` as the container with the state. The `selectionMode` prop accepts `'single'` (the default) and `'range'`.
- When your own code controls the state, use `value` with `onChange`. When the component controls the state, use `defaultValue`. The single mode uses `YYYY-MM-DD`. The range mode uses `{ start?, end? }`.
- The `visibleMonths` prop sets the number of the months in the calendar, and it changes how the triggers move between the months.
- The `showOutsideDays` prop controls the days that are not in the current month. The default is `false`, and the calendar does not show them.
- The `isDateUnavailable` prop makes specified days unavailable. The user cannot select them and the focus does not go to them.
- Use `monthHeadingStyle="month-year"` on `Calendar.Root` to make the heading in two parts: the month and the year.

## Accessibility

- Each grid has an accessible name. The name comes from the month heading that the user sees. The day of today has `aria-current="date"`.
- An unavailable cell has `aria-disabled="true"`, but it keeps the focus. Thus a screen reader user can move to it and read it.
- The `ArrowRight` key and the `ArrowLeft` key move the focus by one day. The `ArrowDown` key and the `ArrowUp` key move the focus by one week.
- The `Home` key and the `End` key move the focus to the first day and to the last day of the month. The `PageUp` key and the `PageDown` key move the focus to the previous month and to the next month. The day number stays the same.
- The `Enter` key and the `Space` key select the date with the focus. In the range mode, they complete the range.

## API reference

<ApiReference api={api} />
