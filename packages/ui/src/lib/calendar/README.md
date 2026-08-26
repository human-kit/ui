# Calendar

## Description

`Calendar` provides single-date and range selection (ISO `YYYY-MM-DD`) with keyboard navigation, controlled/uncontrolled state, and part-based composition.

## Usage Guidelines

- Use `Calendar.Root` as the stateful container.
- `selectionMode` supports `'single'` (default) and `'range'`.
- In controlled mode, use `value` with `onChange`; in uncontrolled mode, use `defaultValue`.
- In `single` mode, `value/defaultValue` is `YYYY-MM-DD`.
- In `range` mode, `value/defaultValue` is `{ start?: 'YYYY-MM-DD', end?: 'YYYY-MM-DD' }`.
- `visibleMonths` sets the number of the months, and it changes how far the triggers move.
- `showOutsideDays` controls whether days outside the current month are shown; default is `false`.
- `isDateUnavailable` marks specific days as non-focusable and non-selectable.
- Use `LocaleProvider` to localize month/day labels and first day of week.
- Use `firstDayOfWeek` to override the locale-specified first day of the week.
- Use `monthHeadingStyle="month-year"` on `Calendar.Root` to make the heading in two parts: the month and the year. An example is `May 2026`, in place of one string from the locale.
- Use `weekdayStyle="narrow" | "short" | "long"` on `Calendar.Grid` to control weekday header labels.
- Keyboard navigation uses `Arrow` keys for day/week movement and `Home/End` for month edges.

## Accessibility

- Each `grid` exposes an accessible name using the visible month heading.
- Today exposes `aria-current="date"`.
- Unavailable cells expose `aria-disabled="true"`. According to ARIA Grid specifications, disabled cells remain focusable so that screen reader users can spatially navigate and discover them, but they are not selectable.

### Keyboard

- `ArrowRight/ArrowLeft`: move focus by +/- 1 day.
- `ArrowDown/ArrowUp`: move focus by +/- 7 days.
- `Home/End`: move focus to first/last day of month.
- `PageUp/PageDown`: move to previous/next month while trying to preserve day number.
- `Enter` or `Space`: select the focused date (if selectable).
- In `selectionMode="range"`, `Arrow/Page/Home/End` extend preview range while a range is pending.
- In `selectionMode="range"`, `Enter` or `Space` confirm the preview when pending.

## Internal Notes

- The `PageUp` key and the `PageDown` key keep the day number when they cross a month. The new month can have no day that takes the focus, while a range is not complete. The focus then goes to the last available day of the current month. The `Home` key and the `End` key do the same.
- In `selectionMode="range"`, the first click starts the range (`start`) and the second click confirms it (`end`), with automatic normalization for reversed selection order.
- In `selectionMode="range"`, hover updates a live preview before confirmation.

## Anatomy

- `Calendar.Root`
- `Calendar.TriggerPrevious`
- `Calendar.Heading`
- `Calendar.TriggerNext`
- `Calendar.Grid`
- `Calendar.GridHeader`
- `Calendar.HeaderCell`
- `Calendar.GridBody`
- `Calendar.BodyCell`

```svelte
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
