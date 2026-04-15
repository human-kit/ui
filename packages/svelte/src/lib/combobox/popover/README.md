# ComboBox Popover

## API reference

### ComboBox.Popover

Name: `ComboBox.Popover`  
Description: Floating container for combobox options. Internally composes `Popover.Root` and `Popover.Content` in non-modal mode.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `offset` | `number` | `8` | Main-axis offset from the combobox trigger. |
| `placement` | `ExtendedPlacement` | `'bottom-start'` | Preferred floating placement. |
| `shouldFlip` | `boolean` | `true` | Enables automatic fallback placement when space is limited. |
| `boundaryElement` | `Element \| null` | `null` | Optional boundary element for positioning constraints. |
| `class` | `string` | `''` | CSS class names for the floating panel. |
| `children` | `Snippet` | `undefined` | Popover content, typically `ComboBox.List`. |
| `isNonModal` | `boolean` | `true` | Controls whether the popover behaves as a non-modal overlay. |
| `shouldCloseOnInteractOutside` | `boolean` | `true` | Closes when interacting outside the panel. |
| `shouldCloseOnEscape` | `boolean` | `true` | Closes on Escape key press. |
| `shouldCloseOnBlur` | `boolean` | `true` | Closes on focus leaving trigger/content in the combobox interaction model. |
| `initialFocus` | `FocusTrapOptions['initialFocus']` | `undefined` | Initial focus target when modal focus trapping is enabled. |

## Notes

- `ComboBox.Popover` forwards all `Popover.Content` configuration props except the controlled open-state wiring (`open`, `triggerRef`, and `onOpenChange`).
- The default placement is `bottom-start` to match the combobox input.
