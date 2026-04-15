# ComboBox Clear

## API reference

### ComboBox.Clear

Name: `ComboBox.Clear`  
Description: Optional clear button that resets the input value and clears the current selection without stealing focus from the input.

| Prop           | Type                   | Default     | Description                                                                  |
| -------------- | ---------------------- | ----------- | ---------------------------------------------------------------------------- |
| `class`        | `string`               | `undefined` | CSS class names for the clear element.                                       |
| `children`     | `Snippet`              | `undefined` | Custom clear content. If omitted, an “x” icon is rendered.                   |
| `tabindex`     | `number`               | `-1`        | Tab index applied to the clear button.                                       |
| `...restProps` | `HTMLButtonAttributes` | `-`         | Additional native button attributes.                                         |

## Notes

- `ComboBox.Clear` clears both the visible input text and the selected value(s).
- The clear button is disabled when there is nothing to clear, or when the combobox is disabled, read-only, or pending.
- Clicking the clear button keeps focus on the combobox input.
