# TimePicker Popover

## API reference

### TimePicker.Popover

Name: `TimePicker.Popover`  
Description: Popover content wrapper integrated with `TimePicker.Root` controlled open state and trigger reference.

| Prop           | Type                                     | Default         | Description                                                      |
| -------------- | ---------------------------------------- | --------------- | ---------------------------------------------------------------- |
| `aria-label`   | `string`                                 | `'Time picker'` | Accessible name for the popover dialog content.                  |
| `initialFocus` | `() => HTMLElement \| null \| undefined` | `first wheel`   | Optional initial focus resolver for popover open.                |
| `class`        | `string`                                 | `''`            | CSS class names applied to popover content.                      |
| `...restProps` | `ComponentProps<typeof Popover.Content>` | `-`             | Forwarded popover content props, excluding root-controlled keys. |

### Notes

Name: Root-controlled props  
Description: `open`, `triggerRef`, `onOpenChange`, and `id` are controlled by `TimePicker.Root` and ignored when passed to this part.
