# DatePicker Calendar

## API reference

### DatePicker.Calendar

Name: `DatePicker.Calendar`  
Description: Calendar composition part connected to `DatePicker.Root` selected date and navigation state.

| Prop           | Type                                                                                                                                                            | Default     | Description                                            |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------ |
| `children`     | `Snippet`                                                                                                                                                       | `undefined` | Optional custom calendar content.                      |
| `class`        | `string`                                                                                                                                                        | `''`        | CSS class names for the calendar wrapper.              |
| `...restProps` | `Omit<ComponentProps<typeof Calendar.Root>, 'selectionMode' \| 'value' \| 'defaultValue' \| 'onChange' \| 'disabled' \| 'readonly' \| 'isDateUnavailable'>` | `-`         | Additional calendar root props forwarded by this part. |

### Notes

Name: Root-controlled calendar props  
Description: `selectionMode`, `value`, `defaultValue`, `onChange`, `disabled`, `readonly`, and `isDateUnavailable` are controlled by `DatePicker.Root` and ignored when passed to this part.
