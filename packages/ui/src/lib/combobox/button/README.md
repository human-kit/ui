# ComboBox Button

## API reference

### ComboBox.Button

Name: `ComboBox.Button`  
Description: Compatibility alias for `ComboBox.Trigger`.

| Prop           | Type                   | Default     | Description                                                                             |
| -------------- | ---------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `class`        | `string`               | `undefined` | The CSS class names of the trigger element.                                             |
| `children`     | `Snippet`              | `undefined` | Your own content for the trigger. If you give none, the component makes a chevron icon. |
| `tabindex`     | `number`               | `-1`        | Tab index applied to the trigger button.                                                |
| `...restProps` | `HTMLButtonAttributes` | `-`         | Additional native button attributes.                                                    |

## Notes

- Prefer `ComboBox.Trigger` in new code.
- `ComboBox.Button` forwards all props and behavior to `ComboBox.Trigger`.
