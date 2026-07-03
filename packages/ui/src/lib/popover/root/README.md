# Popover Root

## API reference

### Popover.Root

Name: `Popover.Root`  
Description: Root state container that controls open state, trigger ref, and toggle/open/close actions.

- `open`: `boolean` (default: `undefined`) — Controlled open state. Supports `bind:open`.
- `defaultOpen`: `boolean` (default: `false`) — Initial open state in uncontrolled mode.
- `onOpenChange`: `(open: boolean, details) => void` (default: `undefined`) — Called whenever open state changes. `details` includes `reason`, optional `event`, `cancel()`, and `isCanceled`.
- `triggerRef`: `HTMLElement | null` (default: `null`) — Trigger reference. Supports `bind:triggerRef`.
- `children`: `Snippet` (default: `undefined`) — Composed trigger and content parts.

### Context utilities

Name: `context.ts` helpers  
Description: Context APIs used by trigger and content parts.

| Prop                | Type                                | Default | Description                              |
| ------------------- | ----------------------------------- | ------- | ---------------------------------------- |
| `setPopoverContext` | `(ctx: PopoverContext) => void`     | `-`     | Registers popover context.               |
| `getPopoverContext` | `() => PopoverContext \| undefined` | `-`     | Returns popover context when available.  |
| `PopoverContext`    | `type`                              | `-`     | Context contract with state and actions. |
