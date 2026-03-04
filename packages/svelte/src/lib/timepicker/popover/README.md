# TimePicker.Popover

Popover content part for `TimePicker`.

## Responsibility

- Hosts popover dialog content linked to `TimePicker.Trigger`.
- Delegates positioning/interaction behavior to shared `Popover` primitives.
- Applies safe prop forwarding while keeping root-controlled props internal.

## Usage

```svelte
<TimePicker.Popover>
 <TimePicker.Clock />
</TimePicker.Popover>
```

See parent docs: `../README.md`.
