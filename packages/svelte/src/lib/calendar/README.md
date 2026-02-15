# Calendar

## Description

`Calendar` provides single-date and range selection (ISO `YYYY-MM-DD`) with keyboard navigation, controlled/uncontrolled state, and part-based composition.

## Usage Guidelines

- Use `Calendar.Root` as the stateful container.
- `selectionMode` supports `'single'` (default) and `'range'`.
- In controlled mode, use `value` with `onChange`; in uncontrolled mode, use `defaultValue`.
- In `single` mode, `value/defaultValue` is `YYYY-MM-DD`.
- In `range` mode, `value/defaultValue` is `{ start?: 'YYYY-MM-DD', end?: 'YYYY-MM-DD' }`.
- `visibleMonths` controls how many months are rendered and how paging behaves.
- `showOutsideDays` controls whether days outside the current month are shown; default is `false`.
- `isDateUnavailable` marks specific days as non-focusable and non-selectable.
- Use `LocaleProvider` to localize month/day labels and first day of week.
- Keyboard navigation uses `Arrow` keys for day/week movement and `Home/End` for month edges.

## Accessibility

- Each `grid` exposes an accessible name using the visible month heading.
- Today exposes `aria-current="date"`.
- Unavailable cells expose `aria-disabled="true"` and are neither focusable nor selectable.

### Keyboard

- `ArrowRight/ArrowLeft`: move focus by +/- 1 day.
- `ArrowDown/ArrowUp`: move focus by +/- 7 days.
- `Home/End`: move focus to first/last day of month.
- `PageUp/PageDown`: move to previous/next month while trying to preserve day number.
- `Enter` or `Space`: select the focused date (if selectable).
- In `selectionMode="range"`, `Arrow/Page/Home/End` extend preview range while a range is pending.
- In `selectionMode="range"`, `Enter` or `Space` confirm the preview when pending.

## Internal Notes

- `PageUp/PageDown` try to preserve the day when crossing months; if no focusable target exists in the destination month and a range is pending, focus falls back to the reachable edge in the current month (aligned with `Home/End` behavior).
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
  <Calendar.Grid>
   <Calendar.GridHeader />
   <Calendar.GridBody />
  </Calendar.Grid>
 </Calendar.Root>
</LocaleProvider>
```
