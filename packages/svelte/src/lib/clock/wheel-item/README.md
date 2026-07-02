# Clock WheelItem

## API reference

### Clock.WheelItem

Name: `Clock.WheelItem`  
Description: Headless item renderer for wheel options used by `Clock.WheelColumn` and `TimePicker.WheelColumn`.

| Prop              | Type                                                  | Default     | Description                                                  |
| ----------------- | ----------------------------------------------------- | ----------- | ------------------------------------------------------------ |
| `type`            | `'hour' \| 'minute' \| 'second' \| 'dayPeriod'`       | `required`  | Segment type associated with the option.                     |
| `option`          | `{ value: string; label: string; disabled: boolean }` | `required`  | Option payload rendered by this item.                        |
| `selected`        | `boolean`                                             | `false`     | Marks the item as currently selected.                        |
| `onRequestCenter` | `() => void`                                          | `undefined` | Callback invoked to request centering/selecting this option. |
| `class`           | `string`                                              | `''`        | CSS class names for the item element.                        |
| `...restProps`    | `HTMLAttributes<HTMLDivElement>`                      | `-`         | Additional attributes forwarded to the item element.         |
