# Clock Axis

## API reference

### Clock.Axis

Name: `Clock.Axis`  
Description: Visual overlay band for `Clock.Root`; it is presentational (`aria-hidden`) and does not manage selection.

| Prop           | Type                             | Default     | Description                                          |
| -------------- | -------------------------------- | ----------- | ---------------------------------------------------- |
| `height`       | `number`                         | `undefined` | Optional overlay height in pixels.                   |
| `class`        | `string`                         | `''`        | CSS class names for the overlay element.             |
| `style`        | `string`                         | `''`        | Inline styles merged with the optional height style. |
| `...restProps` | `HTMLAttributes<HTMLDivElement>` | `-`         | Additional attributes forwarded to the overlay div.  |

### Context utilities

Name: `useClockContext`  
Description: Ensures `Clock.Axis` is used within `Clock.Root`.

| Prop              | Type                 | Default | Description                                      |
| ----------------- | -------------------- | ------- | ------------------------------------------------ |
| `useClockContext` | `() => ClockContext` | `-`     | Returns context and throws outside `Clock.Root`. |
