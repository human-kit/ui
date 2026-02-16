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

```svelte
<DatePicker.Root>
 <DatePicker.Input aria-label="Date input">
  {#snippet children(segment)}
   <DatePicker.Segment {segment} />
  {/snippet}
 </DatePicker.Input>
 <DatePicker.Trigger />

 <DatePicker.Popover>
  <DatePicker.Calendar />
 </DatePicker.Popover>
</DatePicker.Root>
```

## Root API

- `value?: string | null` (`YYYY-MM-DD`)
- `defaultValue?: string` (`YYYY-MM-DD`)
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

## Notes

- Locale is read from `LocaleProvider` when available.
- Segment accessible names are resolved automatically from the active locale.
- During segment editing, `onChange(null)` is emitted whenever the draft is invalid.
- Current MVP focuses on date-only values.
