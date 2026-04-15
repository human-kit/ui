# Popover Content

## API reference

### Popover.Content

Name: `Popover.Content`  
Description: Floating panel rendered in a portal. Supports context mode (`Popover.Root`) and standalone controlled mode.

| Prop                           | Type                             | Default     | Description                                                                    |
| ------------------------------ | -------------------------------- | ----------- | ------------------------------------------------------------------------------ |
| `offset`                       | `number`                         | `8`         | Main-axis offset from the anchor element.                                      |
| `placement`                    | `ExtendedPlacement`              | `'bottom'`  | Preferred floating placement.                                                  |
| `shouldFlip`                   | `boolean`                        | `true`      | Enables automatic fallback placement when space is limited.                    |
| `boundaryElement`              | `Element \| null`                | `null`      | Optional boundary element for positioning constraints.                         |
| `children`                     | `Snippet`                        | `undefined` | Rendered popover panel content.                                                |
| `class`                        | `string`                         | `''`        | CSS class names for the panel element.                                         |
| `isNonModal`                   | `boolean`                        | `false`     | Disables modal behaviors (focus trap, scroll lock, outside aria hiding).       |
| `shouldCloseOnInteractOutside` | `boolean`                        | `true`      | Closes when interacting outside the panel.                                     |
| `shouldCloseOnEscape`          | `boolean`                        | `true`      | Closes on Escape key press.                                                    |
| `shouldCloseOnBlur`            | `boolean`                        | `undefined` | Closes on focus leaving trigger/content. Defaults to `true` in non-modal mode. |
| `open`                         | `boolean`                        | `undefined` | Controlled open state in standalone mode.                                      |
| `triggerRef`                   | `HTMLElement \| null`            | `null`      | Trigger reference in standalone mode.                                          |
| `onOpenChange`                 | `(open: boolean) => void`        | `undefined` | Open-state callback in standalone mode.                                        |
| `...restProps`                 | `HTMLAttributes<HTMLDivElement>` | `-`         | Additional panel attributes.                                                   |

## Styling state

`Popover.Content` exposes RAC-style data attributes that can drive CSS or Tailwind animation utilities:

- `data-state="open" | "closed"`
- `data-entering`
- `data-exiting`
- `data-placement="top" | "right" | "bottom" | "left"`

Exit animations keep the panel mounted until the element's own CSS transition or animation finishes. If no motion is defined, the panel unmounts immediately.
