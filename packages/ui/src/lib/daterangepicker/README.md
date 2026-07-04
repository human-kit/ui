# DateRangePicker

## Description

`DateRangePicker` composes two segmented date inputs — start and end — with a popover hosting a range calendar. The committed value is a `{ start, end }` pair of `YYYY-MM-DD` strings, or `null` while the range is empty or incomplete.

## Anatomy

- `DateRangePicker.Root`
- `DateRangePicker.Input` (one with `part="start"`, one with `part="end"`)
- `DateRangePicker.Segment`
- `DateRangePicker.Trigger`
- `DateRangePicker.Popover`
- `DateRangePicker.Calendar`
- `DateRangePicker.TriggerPrevious`
- `DateRangePicker.Heading`
- `DateRangePicker.TriggerNext`
- `DateRangePicker.Grid`
- `DateRangePicker.GridHeader`
- `DateRangePicker.HeaderCell`
- `DateRangePicker.GridBody`
- `DateRangePicker.BodyCell`

```svelte
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

## Usage guidelines

- Use `value` / `onChange` for controlled state and `defaultValue` for uncontrolled state; the value is a `{ start, end }` pair and the empty state is `null` (null-first empty contract, matching `DatePicker`).
- Always render one input with `part="start"` and one with `part="end"`, and pass the same `part` to their segments.
- Use `open` / `defaultOpen` / `onOpenChange` to control the popover, and `closeOnSelect` to keep it open after the range is confirmed.
- Use `minValue` / `maxValue` (`YYYY-MM-DD`) to constrain both the calendar and the typed inputs, and `isDateUnavailable` to mark specific days as non-selectable.
- Set `visibleMonths` on `DateRangePicker.Calendar` to show more than one month, which makes range selection easier.
- `DateRangePicker.Popover` forwards `Popover.Content` props (`placement`, `offset`, `shouldFlip`, …); `open`, `triggerRef`, `onOpenChange`, and `id` are controlled internally.
- `DateRangePicker.Calendar` forwards `Calendar.Root` props except those controlled by `DateRangePicker.Root` (`selectionMode`, `value`, `defaultValue`, `onChange`, `disabled`, `readonly`, `isDateUnavailable`).

## Accessibility

- Give each input its own accessible name (for example `aria-label="Start date"` and `aria-label="End date"`).
- Segment accessible names are resolved automatically from the active locale.
- Each input exposes `aria-invalid` and `data-invalid` when its segment draft is not committable; invalid input is shown, never auto-corrected (see UX decisions in the DatePicker README — the same contract applies).
- Disabled calendar dates remain focusable via keyboard navigation so screen readers can discover and announce them as disabled.
- In the range calendar, the first selection starts the range, arrow keys extend the preview, and `Enter` or `Space` confirms it.

## Notes

- Locale is read from `LocaleProvider` when available.
- Shares the segmented-input engine, popover composition, and focus behavior decisions with `DatePicker` (see `../datepicker/README.md` and `FOCUS_STATE_CONTRACT.md`).
