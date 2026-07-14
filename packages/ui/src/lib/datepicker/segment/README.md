# DatePicker Segment

## API reference

### DatePicker.Segment

Name: `DatePicker.Segment`  
Description: Editable (or literal) date segment renderer used inside `DatePicker.Input`.

| Prop           | Type                              | Default    | Description                                             |
| -------------- | --------------------------------- | ---------- | ------------------------------------------------------- |
| `segment`      | `DatePickerSegmentPart`           | `required` | Segment metadata and text payload.                      |
| `class`        | `string`                          | `''`       | CSS class names for the segment span element.           |
| `...restProps` | `HTMLAttributes<HTMLSpanElement>` | `-`        | Additional attributes forwarded to the segment element. |
