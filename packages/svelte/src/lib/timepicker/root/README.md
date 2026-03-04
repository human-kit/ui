# TimePicker.Root

State and composition root for `TimePicker`.

## Responsibility

- Owns committed value and editable draft state.
- Coordinates open/close behavior for popover content.
- Provides context for `Input`, `Segment`, `Trigger`, `Popover`, and `Clock`.

## Usage

```svelte
<TimePicker.Root>
 <TimePicker.Input>
  {#snippet children(segment)}
   <TimePicker.Segment {segment} />
  {/snippet}
 </TimePicker.Input>
 <TimePicker.Trigger />
 <TimePicker.Popover>
  <TimePicker.Clock />
 </TimePicker.Popover>
</TimePicker.Root>
```

See parent docs: `../README.md`.
