# Clock.Axis

Visual overlay part for `Clock`.

## Responsibility

- Renders a root-level absolute overlay, typically as the central selection band.
- Is purely visual (`aria-hidden`, `pointer-events: none`).
- Does not own or modify selection logic.

## Usage

```svelte
<Clock.Root class="flex gap-2">
 {#snippet column(col)}
  <Clock.WheelColumn type={col.type} class="h-44 w-16" />
 {/snippet}
 <Clock.Axis class="rounded-md ring-1 ring-inset" height={32} />
</Clock.Root>
```

See parent docs: `../README.md`.
