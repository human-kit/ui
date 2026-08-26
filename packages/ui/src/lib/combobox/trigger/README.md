# ComboBox Trigger

## API reference

### ComboBox.Trigger

Name: `ComboBox.Trigger`  
Description: Optional trigger button that toggles the combobox popover without stealing focus from the input.

| Prop           | Type                   | Default     | Description                                                                             |
| -------------- | ---------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `class`        | `string`               | `undefined` | The CSS class names of the trigger element.                                             |
| `children`     | `Snippet`              | `undefined` | Your own content for the trigger. If you give none, the component makes a chevron icon. |
| `tabindex`     | `number`               | `-1`        | Tab index applied to the trigger button.                                                |
| `...restProps` | `HTMLButtonAttributes` | `-`         | Additional native button attributes.                                                    |

## Notes

- `ComboBox.Trigger` reflects the root pending state through `data-pending`.
- While the combobox is disabled, read-only, or pending, the trigger becomes non-interactive.
- The trigger obeys the `click` event. Thus the `Enter` key and the `Space` key work when the trigger can take the focus, for example with `tabindex={0}`. The component stops the pointer press, thus the trigger never takes the DOM focus from the input.
- `aria-controls` is only exposed while the popover is open, because the listbox does not exist in the DOM while closed.
- `ComboBox.Button` remains available as a compatibility alias.
