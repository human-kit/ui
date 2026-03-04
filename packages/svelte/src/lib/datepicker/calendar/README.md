# DatePicker.Calendar

Calendar composition part for `DatePicker.Popover`.

## Responsibility

- Adapts `Calendar` primitive behavior to `DatePicker.Root` state.
- Exposes slots/snippets for header, grid, and body composition.
- Supports child parts such as `DatePicker.TriggerPrevious`, `DatePicker.Heading`, and `DatePicker.BodyCell`.

## Usage

```svelte
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
```

See parent docs: `../README.md`.
