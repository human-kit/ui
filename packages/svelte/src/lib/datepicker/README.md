# DatePicker

## Description

`DatePicker` composes a segmented date input with a calendar popover for selecting dates.

## Anatomy

- `DatePicker.Root`
- `DatePicker.Input`
- `DatePicker.Segment`
- `DatePicker.Trigger`
- `DatePicker.Popover`
- `DatePicker.Calendar`
- `DatePicker.CalendarTriggerPrevious`
- `DatePicker.CalendarHeading`
- `DatePicker.CalendarTriggerNext`
- `DatePicker.CalendarGrid`
- `DatePicker.CalendarGridHeader`
- `DatePicker.CalendarHeaderCell`
- `DatePicker.CalendarGridBody`
- `DatePicker.CalendarBodyCell`

```svelte
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
    <DatePicker.CalendarTriggerPrevious />
    <DatePicker.CalendarHeading />
    <DatePicker.CalendarTriggerNext />
   </div>
   <DatePicker.CalendarGrid>
    <DatePicker.CalendarGridHeader />
    <DatePicker.CalendarGridBody />
   </DatePicker.CalendarGrid>
  </DatePicker.Calendar>
 </DatePicker.Popover>
</DatePicker.Root>
```

## Root API

- `value?: string | null` (`YYYY-MM-DD`)
- `defaultValue?: string | null` (`YYYY-MM-DD`)
- `onChange?: (value: string | null) => void`
- `isDisabled?: boolean`
- `isReadOnly?: boolean`
- `minValue?: string` (`YYYY-MM-DD`)
- `maxValue?: string` (`YYYY-MM-DD`)
- `isDateUnavailable?: (date: string) => boolean`
- `open?: boolean`
- `defaultOpen?: boolean`
- `onOpenChange?: (open: boolean, details: { reason, event?, cancel(), isCanceled }) => void`
- `closeOnSelect?: boolean`
- Null-first empty contract: when `value` and `defaultValue` are omitted, the empty state is `null`.
- `DatePicker.Input` exposes `aria-invalid` and `data-invalid` when the current segment draft is not committeable.

## Popover API

- `DatePicker.Popover` forwards `Popover.Content` props (for example `placement`, `offset`, `shouldFlip`, `boundaryElement`, `isNonModal`, and close behavior props).
- The following are controlled internally by `DatePicker` and are not accepted on `DatePicker.Popover`: `open`, `triggerRef`, `onOpenChange`, `id`.
- Defaults:
  - `placement` defaults to `bottom-start`.
  - `aria-label` defaults to `Calendar`.
  - `initialFocus` defaults to focusing the current active day cell in the calendar grid.

## Calendar API

- `DatePicker.Calendar` forwards `Calendar.Root` props except those controlled by `DatePicker.Root`.
- The following are controlled internally by `DatePicker` and are not accepted on `DatePicker.Calendar`: `selectionMode`, `value`, `defaultValue`, `onChange`, `isDisabled`, `isReadOnly`, `isDateUnavailable`.

## Notes

- Locale is read from `LocaleProvider` when available.
- Segment accessible names are resolved automatically from the active locale.
- During segment editing, the committed value is set to `null` when the draft is incomplete, invalid, out-of-range, or unavailable.
- Current MVP focuses on date-only values.
