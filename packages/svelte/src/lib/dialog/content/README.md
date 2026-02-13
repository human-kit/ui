# Dialog Content

## API reference

### Dialog.Content
Name: `Dialog.Content`  
Description: Modal panel part that applies focus trapping, outside-click handling, scroll lock, aria outside hiding, and topmost stack guards.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Snippet` | `undefined` | Dialog body content. |
| `class` | `string` | `''` | CSS class names for the dialog panel. |
| `shouldCloseOnInteractOutside` | `boolean` | `true` | Enables closing when clicking outside (topmost dialog only). |
| `shouldCloseOnEscape` | `boolean` | `true` | Enables closing on Escape key (topmost dialog only). |
| `...restProps` | `HTMLAttributes<HTMLDivElement>` | `-` | Additional dialog panel attributes. |
