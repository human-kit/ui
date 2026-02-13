# Dialog Root

## API reference

### Dialog.Root
Name: `Dialog.Root`  
Description: Dialog state container for open state, trigger ref, and root-level open/close/toggle actions.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `open` | `boolean` | `undefined` | Controlled open state. Supports `bind:open`. |
| `defaultOpen` | `boolean` | `false` | Initial open state in uncontrolled mode. |
| `onOpenChange` | `(open: boolean) => void` | `undefined` | Called whenever open state changes. |
| `triggerRef` | `HTMLElement | null` | `null` | Trigger reference. Supports `bind:triggerRef`. |
| `children` | `Snippet<[DialogStateHelpers]>` | `undefined` | Root render snippet that receives dialog state helpers. |

### Context utilities
Name: `context.ts` helpers  
Description: Context APIs shared by trigger, portal, overlay, and content parts.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `setDialogContext` | `(ctx: DialogContext) => void` | `-` | Registers dialog context. |
| `getDialogContext` | `() => DialogContext | undefined` | `-` | Returns dialog context when available. |
| `DialogContext` | `type` | `-` | Context contract with dialog state and actions. |

### DialogStateHelpers type
Name: `DialogStateHelpers`  
Description: Helper object passed to the `children` snippet in `Dialog.Root`.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `close` | `() => void` | `-` | Closes the dialog. |
| `open` | `() => void` | `-` | Opens the dialog. |
| `toggle` | `() => void` | `-` | Toggles open state. |
| `isOpen` | `boolean` | `-` | Current open state. |

### Stack utilities
Name: `dialog-stack.ts`  
Description: Internal global stack utilities used by `Dialog.Content` and `Dialog.Overlay` to support nested dialogs.

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `pushDialog` | `(close: () => void) => { id: symbol; level: number }` | `-` | Registers an opened dialog and returns stack id/level. |
| `popDialog` | `(id: symbol) => void` | `-` | Unregisters a dialog by id. |
| `isTopmostDialog` | `(id: symbol) => boolean` | `-` | Returns whether a dialog is currently topmost. |
| `getOverlayZIndex` | `(level: number) => number` | `BASE + level * 10` | Computes overlay z-index for a stack level. |
| `getContentZIndex` | `(level: number) => number` | `BASE + level * 10 + 1` | Computes content z-index for a stack level. |
| `getDialogCount` | `() => number` | `-` | Returns the number of currently open dialogs. |
