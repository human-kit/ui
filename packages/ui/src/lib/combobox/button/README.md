# ComboBox Button

## API reference

### ComboBox.Button

Name: `ComboBox.Button`  
Description: Compatibility alias for `ComboBox.Trigger`.

| Prop           | Type                   | Default     | Description                                                     |
| -------------- | ---------------------- | ----------- | --------------------------------------------------------------- |
| `class`        | `string`               | `undefined` | CSS class names for the trigger element.                        |
| `children`     | `Snippet`              | `undefined` | Custom trigger content. If omitted, a chevron icon is rendered. |
| `tabindex`     | `number`               | `-1`        | Tab index applied to the trigger button.                        |
| `...restProps` | `HTMLButtonAttributes` | `-`         | Additional native button attributes.                            |

## Notes

- Prefer `ComboBox.Trigger` in new code.
- `ComboBox.Button` forwards all props and behavior to `ComboBox.Trigger`.
