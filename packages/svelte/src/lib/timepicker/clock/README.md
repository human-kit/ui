# TimePicker.Clock

Wheel-columns part for `TimePicker.Popover`.

## Responsibility

- Renders visible clock columns from `TimePicker.Root` state.
- Reuses `Clock` wheel primitives and context contract.
- Supports `column` snippet customization for per-column UI.

## Usage

```svelte
<TimePicker.Popover>
 <TimePicker.Clock class="flex gap-2">
  {#snippet column(col)}
   <TimePicker.WheelColumn type={col.type} class="h-44 w-16" />
  {/snippet}
 </TimePicker.Clock>
</TimePicker.Popover>
```

See parent docs: `../README.md`.
