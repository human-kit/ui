# Clock.WheelColumn

Composable wheel column part for `Clock` and `TimePicker.Clock`.

## Responsibility

- Renders one spinbutton column for a single segment (`hour`, `minute`, `second`, `dayPeriod`).
- Handles keyboard navigation and wheel snapping behavior.
- Exposes focus state via `data-focus-within` and `data-focus-visible`.

## Usage

```svelte
<Clock.WheelColumn type="hour" class="h-44 w-16 rounded-md">
 {#snippet children(option)}
  <Clock.WheelItem type="hour" {option} class="..." />
 {/snippet}
</Clock.WheelColumn>
```

See parent docs: `../README.md`.
