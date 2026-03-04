# DatePicker.Input

Segment container part for `DatePicker`.

## Responsibility

- Wraps date segments in input-like structure.
- Exposes validity/focus states from root context.
- Supports snippet-driven custom segment rendering.

## Usage

```svelte
<DatePicker.Input aria-label="Date input">
 {#snippet children(segment)}
  <DatePicker.Segment {segment} />
 {/snippet}
</DatePicker.Input>
```

See parent docs: `../README.md`.
