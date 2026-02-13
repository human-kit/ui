# Popover Root

## API reference

### Popover.Root

Name: `Popover.Root`  
Description: Root state container that controls open state, trigger ref, and toggle/open/close actions.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `undefined` | Controlled open state. Supports `bind:open`. |
| `defaultOpen` | `boolean` | `false` | Initial open state in uncontrolled mode. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Called whenever open state changes. |
| `triggerRef` | `HTMLElement \| null` | `null` | Trigger reference. Supports `bind:triggerRef`. |
| `children` | `Snippet` | `undefined` | Composed trigger and content parts. |

### Context utilities

Name: `context.ts` helpers  
Description: Context APIs used by trigger and content parts.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `setPopoverContext` | `(ctx: PopoverContext) => void` | `-` | Registers popover context. |
| `getPopoverContext` | `() => PopoverContext \| undefined` | `-` | Returns popover context when available. |
| `PopoverContext` | `type` | `-` | Context contract with state and actions. |
| `PopoverTriggerContext` | `type alias` | `PopoverContext` | Backward-compatible alias. |
| `setPopoverTriggerContext` | `alias` | `setPopoverContext` | Backward-compatible alias. |
| `getPopoverTriggerContext` | `alias` | `getPopoverContext` | Backward-compatible alias. |
