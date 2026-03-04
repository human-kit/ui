# Clock.Root

Composable root part for `Clock`.

## Responsibility

- Owns clock state (`value`, `granularity`, `hourCycle`, range checks).
- Resolves visible columns (`hour`, `minute`, `second`, `dayPeriod`).
- Provides context consumed by `Clock.WheelColumn`, `Clock.WheelItem`, and `Clock.Axis`.

## Usage

```svelte
<Clock.Root value="14:30" granularity="minute" hourCycle={24} class="flex gap-2" />
```

Use the `column` snippet for custom column rendering, and `children` for overlays (for example `Clock.Axis`).

See parent docs: `../README.md`.
