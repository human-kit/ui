# DatePicker Input

## API reference

### DatePicker.Input

Name: `DatePicker.Input`  
Description: Segmented date input group tied to `DatePicker.Root` value and focus management.

| Prop           | Type                               | Default     | Description                                           |
| -------------- | ---------------------------------- | ----------- | ----------------------------------------------------- |
| `children`     | `Snippet<[DatePickerSegmentPart]>` | `undefined` | Optional custom renderer for each date segment part.  |
| `class`        | `string`                           | `''`        | CSS class names for the input group element.          |
| `aria-label`   | `string`                           | `undefined` | Accessible label for the segmented input group.       |
| `...restProps` | `HTMLAttributes<HTMLDivElement>`   | `-`         | Additional attributes forwarded to the group element. |
