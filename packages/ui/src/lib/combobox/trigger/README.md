# ComboBox Trigger

## API reference

### ComboBox.Trigger

Name: `ComboBox.Trigger`  
Description: Optional trigger button that toggles the combobox popover without stealing focus from the input.

| Prop           | Type                   | Default     | Description                                                     |
| -------------- | ---------------------- | ----------- | --------------------------------------------------------------- |
| `class`        | `string`               | `undefined` | CSS class names for the trigger element.                        |
| `children`     | `Snippet`              | `undefined` | Custom trigger content. If omitted, a chevron icon is rendered. |
| `tabindex`     | `number`               | `-1`        | Tab index applied to the trigger button.                        |
| `...restProps` | `HTMLButtonAttributes` | `-`         | Additional native button attributes.                            |

## Notes

- `ComboBox.Trigger` reflects the root pending state through `data-pending`.
- While the combobox is disabled, read-only, or pending, the trigger becomes non-interactive.
- The trigger toggles on `click`, so keyboard activation (Enter/Space) works when the trigger is focusable (e.g. `tabindex={0}`). The pointer press itself is prevented so it never steals DOM focus from the input.
- `aria-controls` is only exposed while the popover is open, because the listbox does not exist in the DOM while closed.
- `ComboBox.Button` remains available as a compatibility alias.
