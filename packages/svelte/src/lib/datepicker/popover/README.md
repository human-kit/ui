# DatePicker Popover

## API reference

### DatePicker.Popover

Name: `DatePicker.Popover`  
Description: Popover content wrapper for calendar and optional time controls, synchronized with `DatePicker.Root` open state.

| Prop           | Type                                     | Default      | Description                                                      |
| -------------- | ---------------------------------------- | ------------ | ---------------------------------------------------------------- |
| `aria-label`   | `string`                                 | `'Calendar'` | Accessible name for the popover content.                         |
| `initialFocus` | `() => HTMLElement \| null \| undefined` | `active day` | Optional initial focus resolver for popover open.                |
| `class`        | `string`                                 | `''`         | CSS class names for popover content.                             |
| `...restProps` | `ComponentProps<typeof Popover.Content>` | `-`          | Forwarded popover content props, excluding root-controlled keys. |

### Notes

Name: Root-controlled props  
Description: `open`, `triggerRef`, `onOpenChange`, and `id` are controlled by `DatePicker.Root` and ignored when passed to this part.
