# Calendar Root

## API reference

### Calendar.Root

Name: `Calendar.Root`  
Description: Root state container for date grid rendering, navigation, selection, and locale-aware formatting.

| Prop                | Type                                                       | Default     | Description                                                         |
| ------------------- | ---------------------------------------------------------- | ----------- | ------------------------------------------------------------------- |
| `selectionMode`     | `'single' \| 'range'`                                      | `'single'`  | Selection behavior and value shape.                                 |
| `value`             | `CalendarDateValue \| CalendarRangeValue \| undefined`     | `bindable`  | Controlled selected value (single date or `{ start, end }`).        |
| `defaultValue`      | `CalendarDateValue \| CalendarRangeValue \| undefined`     | `undefined` | Initial value for uncontrolled mode.                                |
| `onChange`          | `(value: CalendarDateValue \| CalendarRangeValue) => void` | `undefined` | Called when selection changes.                                      |
| `visibleMonths`     | `number`                                                   | `1`         | Number of month grids rendered simultaneously.                      |
| `showOutsideDays`   | `boolean`                                                  | `false`     | Whether days outside the visible month remain rendered/interactive. |
| `isDateUnavailable` | `(date: string) => boolean`                                | `undefined` | Marks specific dates as unavailable.                                |
| `disabled`          | `boolean`                                                  | `false`     | Disables interaction and navigation.                                |
| `readonly`          | `boolean`                                                  | `false`     | Keeps navigation while preventing selection updates.                |
| `children`          | `Snippet`                                                  | `undefined` | Composed `Calendar` parts.                                          |
| `class`             | `string`                                                   | `''`        | CSS class names for the root wrapper.                               |
| `id`                | `string`                                                   | `undefined` | Optional root id.                                                   |
| `element`           | `HTMLDivElement \| null`                                   | `bindable`  | Reference to the root wrapper element.                              |
| `aria-label`        | `string`                                                   | `undefined` | Accessible label for the root wrapper.                              |
