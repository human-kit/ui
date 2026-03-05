# TimePicker Input

## API reference

### TimePicker.Input

Name: `TimePicker.Input`  
Description: Group wrapper for rendered time segments; manages focus entry and state attributes from `TimePicker.Root`.

| Prop           | Type                               | Default     | Description                                           |
| -------------- | ---------------------------------- | ----------- | ----------------------------------------------------- |
| `children`     | `Snippet<[TimePickerSegmentPart]>` | `undefined` | Optional custom renderer for each segment part.       |
| `class`        | `string`                           | `''`        | CSS class names for the group element.                |
| `aria-label`   | `string`                           | `undefined` | Accessible label for the input group.                 |
| `...restProps` | `HTMLAttributes<HTMLDivElement>`   | `-`         | Additional attributes forwarded to the group element. |
