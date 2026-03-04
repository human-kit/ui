# DatePicker.Root

State and composition root for `DatePicker`.

## Responsibility

- Owns committed date value and editable segment draft.
- Coordinates popover open/close and calendar synchronization.
- Provides context for `Input`, `Segment`, `Trigger`, `Popover`, and `Calendar`.

## Usage

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

See parent docs: `../README.md`.
