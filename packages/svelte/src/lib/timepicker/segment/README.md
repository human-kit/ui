# TimePicker Segment

## API reference

### TimePicker.Segment

Name: `TimePicker.Segment`  
Description: Editable (or literal) segment renderer used inside `TimePicker.Input`.

| Prop           | Type                              | Default    | Description                                             |
| -------------- | --------------------------------- | ---------- | ------------------------------------------------------- |
| `segment`      | `TimePickerSegmentPart`           | `required` | Segment metadata and rendered text payload.             |
| `class`        | `string`                          | `''`       | CSS class names for the segment span element.           |
| `...restProps` | `HTMLAttributes<HTMLSpanElement>` | `-`        | Additional attributes forwarded to the segment element. |
