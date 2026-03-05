# DatePicker Root

## API reference

### DatePicker.Root

Name: `DatePicker.Root`  
Description: State container for segmented date input, popover lifecycle, calendar selection, and validation constraints.

| Prop                | Type                                           | Default     | Description                                               |
| ------------------- | ---------------------------------------------- | ----------- | --------------------------------------------------------- |
| `value`             | `DatePickerDateValue \| null`                  | `bindable`  | Controlled ISO date value (`YYYY-MM-DD`).                 |
| `defaultValue`      | `DatePickerDateValue \| null`                  | `undefined` | Initial date value for uncontrolled mode.                 |
| `onChange`          | `(value: DatePickerDateValue \| null) => void` | `undefined` | Called when committed date value changes.                 |
| `open`              | `boolean`                                      | `bindable`  | Controlled open state for the popover panel.              |
| `defaultOpen`       | `boolean`                                      | `false`     | Initial open state in uncontrolled mode.                  |
| `onOpenChange`      | `(open: boolean, details) => void`             | `undefined` | Called on open-state transitions (supports cancellation). |
| `closeOnSelect`     | `boolean`                                      | `true`      | Closes the popover after calendar selection.              |
| `minValue`          | `DatePickerDateValue`                          | `undefined` | Optional lower bound for selectable dates.                |
| `maxValue`          | `DatePickerDateValue`                          | `undefined` | Optional upper bound for selectable dates.                |
| `isDateUnavailable` | `(date: DatePickerDateValue) => boolean`       | `undefined` | Optional predicate to block unavailable dates.            |
| `isDisabled`        | `boolean`                                      | `false`     | Disables interaction and selection.                       |
| `isReadOnly`        | `boolean`                                      | `false`     | Prevents value changes while preserving navigation.       |
| `children`          | `Snippet`                                      | `undefined` | Composed `DatePicker` parts.                              |
| `class`             | `string`                                       | `''`        | CSS class names for root wrapper.                         |
| `aria-label`        | `string`                                       | `undefined` | Accessible label for the root wrapper.                    |

### Context utilities

Name: `setDatePickerContext` / `getDatePickerContext` / `useDatePickerContext`  
Description: Context helpers for internal/public `DatePicker` part composition.

| Prop                   | Type                                   | Default | Description                                         |
| ---------------------- | -------------------------------------- | ------- | --------------------------------------------------- |
| `setDatePickerContext` | `(ctx: DatePickerContext) => void`     | `-`     | Publishes root context.                             |
| `getDatePickerContext` | `() => DatePickerContext \| undefined` | `-`     | Reads context when available.                       |
| `useDatePickerContext` | `() => DatePickerContext`              | `-`     | Reads context and throws outside `DatePicker.Root`. |
| `DatePickerContext`    | `type`                                 | `-`     | Shared context contract for all datepicker parts.   |
