---
title: Calendar
description: A composable calendar with single-date and range selection, keyboard grid navigation, unavailable dates, and locale-aware rendering.
---

<script>
	import Demo from '$lib/docs/demo.svelte';
	import ApiReference from '$lib/docs/api-reference.svelte';
	import Hero from './demos/hero.svelte';
	import heroSource from './demos/hero.svelte?highlight';
	import Range from './demos/range.svelte';
	import rangeSource from './demos/range.svelte?highlight';
	import Locale from './demos/locale.svelte';
	import localeSource from './demos/locale.svelte?highlight';
	import api from './api.json';
</script>

# Calendar

A composable calendar providing single-date and range selection (ISO `YYYY-MM-DD`) with keyboard navigation, controlled/uncontrolled state, and part-based composition.

<Demo source={heroSource}><Hero /></Demo>

## Anatomy

`Calendar.Root` is the stateful container. The triggers and heading page through months, while `Calendar.Grid` renders one month as an accessible grid built from header and body cells.

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

Set `selectionMode="range"` to select a `{ start, end }` pair: the first click starts the range, hover previews it, and the second click confirms it (reversed order is normalized automatically). `isDateUnavailable` marks specific days — weekends here — as non-selectable.

<Demo source={rangeSource}><Range /></Demo>

## Locale

Wrap the calendar in a `LocaleProvider` to localize the month heading, weekday labels, and first day of the week. Use `firstDayOfWeek` on `Calendar.Root` to override the locale default, and `weekdayStyle` on `Calendar.Grid` to switch between narrow, short, and long weekday labels.

<Demo source={localeSource}><Locale /></Demo>

## Usage guidelines

- Use `Calendar.Root` as the stateful container; `selectionMode` supports `'single'` (default) and `'range'`.
- In controlled mode use `value` with `onChange`; in uncontrolled mode use `defaultValue`. Single mode uses `YYYY-MM-DD`, range mode uses `{ start?, end? }`.
- `visibleMonths` controls how many months are rendered and how paging behaves.
- `showOutsideDays` controls whether days outside the current month are shown (default `false`).
- `isDateUnavailable` marks specific days as non-focusable and non-selectable.
- Use `monthHeadingStyle="month-year"` on `Calendar.Root` to render headings as separate month and year parts.

## Accessibility

- Each grid exposes an accessible name using the visible month heading, and today exposes `aria-current="date"`.
- Unavailable cells expose `aria-disabled="true"` but remain focusable, so screen reader users can spatially navigate and discover them.
- `ArrowRight`/`ArrowLeft` move focus by one day; `ArrowDown`/`ArrowUp` move by one week.
- `Home`/`End` jump to the first/last day of the month; `PageUp`/`PageDown` move to the previous/next month while preserving the day number.
- `Enter` or `Space` selects the focused date; in range mode they confirm the pending preview range.

## API reference

<ApiReference {api} />
