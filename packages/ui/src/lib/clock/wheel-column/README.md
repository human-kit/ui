# Clock WheelColumn

## API reference

### Clock.WheelColumn

Name: `Clock.WheelColumn`  
Description: Scrollable spinbutton column for a single editable segment (`hour`, `minute`, `second`, `dayPeriod`).

| Prop           | Type                                                             | Default         | Description                                                 |
| -------------- | ---------------------------------------------------------------- | --------------- | ----------------------------------------------------------- |
| `type`         | `'hour' \| 'minute' \| 'second' \| 'dayPeriod'`                  | `required`      | Segment represented by this wheel column.                   |
| `children`     | `Snippet<[{ value: string; label: string; disabled: boolean }]>` | `undefined`     | Optional custom item renderer for each wheel option.        |
| `class`        | `string`                                                         | `'h-55'`        | CSS class names for the spinbutton column.                  |
| `aria-label`   | `string`                                                         | `segment label` | Overrides the computed accessible column label.             |
| `...restProps` | `HTMLAttributes<HTMLDivElement>`                                 | `-`             | Additional attributes forwarded to the column root element. |

### Context utilities

Name: `useClockContext`  
Description: Reads shared state and operations from `Clock.Root`.

| Prop              | Type                 | Default | Description                                      |
| ----------------- | -------------------- | ------- | ------------------------------------------------ |
| `useClockContext` | `() => ClockContext` | `-`     | Returns context and throws outside `Clock.Root`. |
