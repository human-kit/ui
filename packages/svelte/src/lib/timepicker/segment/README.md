# TimePicker.Segment

Editable segment part used inside `TimePicker.Input`.

## Responsibility

- Renders one time segment (`hour`, `minute`, `second`, `dayPeriod`, or literal).
- Handles keyboard editing and segment-level focus behavior.
- Reflects placeholder/value/invalid states from root context.

## Usage

```svelte
<TimePicker.Input>
 {#snippet children(segment)}
  <TimePicker.Segment {segment} class="time-picker-segment" />
 {/snippet}
</TimePicker.Input>
```

See parent docs: `../README.md`.
