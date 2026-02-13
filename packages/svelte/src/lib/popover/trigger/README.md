# Popover Trigger

## API reference

### Popover.Trigger

Name: `Popover.Trigger`  
Description: Wrapper trigger part that finds a button in its children, wires it as trigger, and toggles the popover on click.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Snippet` | `undefined` | Child content that includes a trigger element (`button` or `[role="button"]`). |

### Popover.TriggerButton

Name: `Popover.TriggerButton`  
Description: Pre-wired trigger button part for popover toggling.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `Snippet` | `undefined` | Button content. |
| `class` | `string` | `''` | CSS class names for the button. |
| `...restProps` | `HTMLButtonAttributes` | `-` | Additional native button attributes, excluding reserved trigger semantics. |
