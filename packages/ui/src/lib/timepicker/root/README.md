# TimePicker Root

## API reference

### TimePicker.Root

Name: `TimePicker.Root`  
Description: State container for segmented time input, popover lifecycle, wheel selection, and value validation.

| Prop           | Type                               | Default     | Description                                                  |
| -------------- | ---------------------------------- | ----------- | ------------------------------------------------------------ |
| `value`        | `string \| null`                   | `bindable`  | Controlled time value (`HH:mm` or `HH:mm:ss`).               |
| `defaultValue` | `string \| null`                   | `undefined` | Initial value for uncontrolled mode.                         |
| `onChange`     | `(value: string \| null) => void`  | `undefined` | Called when committed value changes.                         |
| `open`         | `boolean`                          | `bindable`  | Controlled open state for popover panel.                     |
| `defaultOpen`  | `boolean`                          | `false`     | Initial open state in uncontrolled mode.                     |
| `onOpenChange` | `(open: boolean, details) => void` | `undefined` | Called on open-state transitions (supports cancellation).    |
| `hourCycle`    | `12 \| 24`                         | `locale`    | Hour cycle used for rendering and parsing.                   |
| `granularity`  | `'hour' \| 'minute' \| 'second'`   | `'minute'`  | Controls visible segments and wheel columns.                 |
| `hourStep`     | `number`                           | `1`         | Hour increment for segment and wheel interactions.           |
| `minuteStep`   | `number`                           | `1`         | Minute increment for segment and wheel interactions.         |
| `secondStep`   | `number`                           | `1`         | Second increment for segment and wheel interactions.         |
| `minValue`     | `string`                           | `undefined` | Optional lower bound for valid values.                       |
| `maxValue`     | `string`                           | `undefined` | Optional upper bound for valid values.                       |
| `disabled`     | `boolean`                          | `false`     | Disables user interaction.                                   |
| `readonly`     | `boolean`                          | `false`     | Prevents value changes while keeping focus/navigation.       |
| `required`     | `boolean`                          | `false`     | Propagates required state to input accessibility attributes. |
| `children`     | `Snippet`                          | `undefined` | Composed `TimePicker` parts.                                 |
| `class`        | `string`                           | `''`        | CSS class names for the root element.                        |
| `element`      | `HTMLDivElement \| null`           | `bindable`  | Reference to the root DOM element.                           |
| `aria-label`   | `string`                           | `undefined` | Accessible label for the root wrapper.                       |

### Context utilities

Name: `setTimePickerContext` / `getTimePickerContext` / `useTimePickerContext`  
Description: Context helpers for internal/public part composition.

| Prop                   | Type                                   | Default | Description                                         |
| ---------------------- | -------------------------------------- | ------- | --------------------------------------------------- |
| `setTimePickerContext` | `(ctx: TimePickerContext) => void`     | `-`     | Publishes root context.                             |
| `getTimePickerContext` | `() => TimePickerContext \| undefined` | `-`     | Reads context when available.                       |
| `useTimePickerContext` | `() => TimePickerContext`              | `-`     | Reads context and throws outside `TimePicker.Root`. |
| `TimePickerContext`    | `type`                                 | `-`     | Full context contract used by all child parts.      |
