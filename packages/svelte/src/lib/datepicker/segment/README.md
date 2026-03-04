# DatePicker.Segment

Editable segment part used inside `DatePicker.Input`.

## Responsibility

- Renders one date segment (`day`, `month`, `year`, or literal).
- Handles keyboard editing and segment-level focus behavior.
- Reflects placeholder/value/invalid states from root context.

## Usage

```svelte
<DatePicker.Input>
 {#snippet children(segment)}
  <DatePicker.Segment {segment} class="date-picker-segment" />
 {/snippet}
</DatePicker.Input>
```

See parent docs: `../README.md`.
