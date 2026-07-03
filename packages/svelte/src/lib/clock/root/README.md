# Clock Root

## API reference

### Clock.Root

Name: `Clock.Root`  
Description: Standalone wheel-based time state container that resolves visible columns and publishes selection context for child parts.

| Prop           | Type                              | Default     | Description                                                |
| -------------- | --------------------------------- | ----------- | ---------------------------------------------------------- |
| `value`        | `string \| null`                  | `bindable`  | Controlled time value (`HH:mm` or `HH:mm:ss`).             |
| `defaultValue` | `string \| null`                  | `undefined` | Initial value for uncontrolled usage.                      |
| `onChange`     | `(value: string \| null) => void` | `undefined` | Called when a committed wheel selection changes the value. |
| `hourCycle`    | `12 \| 24`                        | `locale`    | Hour cycle used for rendering and validation.              |
| `granularity`  | `'hour' \| 'minute' \| 'second'`  | `'minute'`  | Controls visible wheel columns and emitted precision.      |
| `hourStep`     | `number`                          | `1`         | Hour increment used by wheel and keyboard navigation.      |
| `minuteStep`   | `number`                          | `1`         | Minute increment used by wheel and keyboard navigation.    |
| `secondStep`   | `number`                          | `1`         | Second increment used by wheel and keyboard navigation.    |
| `minValue`     | `string`                          | `undefined` | Optional lower bound for selectable values.                |
| `maxValue`     | `string`                          | `undefined` | Optional upper bound for selectable values.                |
| `disabled`     | `boolean`                         | `false`     | Disables wheel interaction and value updates.              |
| `column`       | `Snippet<[ClockColumnInfo]>`      | `undefined` | Optional custom renderer for each resolved column.         |
| `children`     | `Snippet`                         | `undefined` | Optional additional content rendered inside the root.      |
| `class`        | `string`                          | `''`        | CSS class names for the root element.                      |
| `element`      | `HTMLDivElement \| null`          | `bindable`  | Reference to the root DOM element.                         |
| `aria-label`   | `string`                          | `undefined` | Accessible label for the root group.                       |

### Context utilities

Name: `setClockContext` / `getClockContext` / `useClockContext`  
Description: Context helpers used by `Clock.Axis`, `Clock.WheelColumn`, and other clock parts.

| Prop              | Type                              | Default | Description                                              |
| ----------------- | --------------------------------- | ------- | -------------------------------------------------------- |
| `setClockContext` | `(ctx: ClockContext) => void`     | `-`     | Publishes clock context from root.                       |
| `getClockContext` | `() => ClockContext \| undefined` | `-`     | Reads clock context when available.                      |
| `useClockContext` | `() => ClockContext`              | `-`     | Reads context and throws outside `Clock.Root`.           |
| `ClockContext`    | `type`                            | `-`     | Shared contract for state, labels, and wheel operations. |
