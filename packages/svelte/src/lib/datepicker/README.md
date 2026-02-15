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
 <DatePicker.Input>
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

- `value?: string` (`YYYY-MM-DD`)
- `defaultValue?: string` (`YYYY-MM-DD`)
- `onChange?: (value: string) => void`
- `isDisabled?: boolean`
- `isReadOnly?: boolean`
- `minValue?: string` (`YYYY-MM-DD`)
- `maxValue?: string` (`YYYY-MM-DD`)
- `open?: boolean`
- `defaultOpen?: boolean`
- `onOpenChange?: (open: boolean) => void`
- `closeOnSelect?: boolean`

## Notes

- Locale is read from `LocaleProvider` when available.
- Current MVP focuses on date-only values.
