# TimePicker.Input

Segment container part for `TimePicker`.

## Responsibility

- Wraps and arranges segments in input-like presentation.
- Exposes focus/invalid states from `TimePicker.Root`.
- Supports custom rendering through snippet children.

## Usage

```svelte
<TimePicker.Input aria-label="Time input">
 {#snippet children(segment)}
  <TimePicker.Segment {segment} />
 {/snippet}
</TimePicker.Input>
```

See parent docs: `../README.md`.
