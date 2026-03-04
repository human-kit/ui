# DatePicker.Popover

Popover content part for `DatePicker`.

## Responsibility

- Hosts calendar dialog content linked to `DatePicker.Trigger`.
- Delegates positioning/interaction behavior to shared `Popover` primitives.
- Applies safe prop forwarding while keeping root-controlled props internal.

## Usage

```svelte
<DatePicker.Popover>
 <DatePicker.Calendar />
</DatePicker.Popover>
```

See parent docs: `../README.md`.
