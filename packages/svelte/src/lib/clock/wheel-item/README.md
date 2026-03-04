# Clock.WheelItem

Headless item part for wheel columns.

## Responsibility

- Renders one selectable wheel option.
- Publishes state attributes such as `data-selected`, `data-disabled`, and `data-centered`.
- Leaves final visual styling to consumers.

## Usage

```svelte
<Clock.WheelItem
 type={col.type}
 {option}
 class="flex min-h-8 items-center justify-center rounded-md px-2"
/>
```

Typically used inside `Clock.WheelColumn` or `TimePicker.WheelColumn` snippet overrides.

See parent docs: `../README.md`.
