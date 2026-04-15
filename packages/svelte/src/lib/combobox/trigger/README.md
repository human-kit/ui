# ComboBox Trigger

## API reference

### ComboBox.Trigger

Name: `ComboBox.Trigger`  
Description: Optional trigger button that toggles the combobox popover without stealing focus from the input.

| Prop           | Type                   | Default     | Description                                                                  |
| -------------- | ---------------------- | ----------- | ---------------------------------------------------------------------------- |
| `class`        | `string`               | `undefined` | CSS class names for the trigger element.                                     |
| `children`     | `Snippet`              | `undefined` | Custom trigger content. If omitted, a chevron icon is rendered.              |
| `tabindex`     | `number`               | `-1`        | Tab index applied to the trigger button.                                     |
| `...restProps` | `HTMLButtonAttributes` | `-`         | Additional native button attributes.                                         |

## Notes

- `ComboBox.Trigger` reflects the root pending state through `data-pending`.
- While the combobox is disabled, read-only, or pending, the trigger becomes non-interactive.
- `ComboBox.Button` remains available as a compatibility alias.
