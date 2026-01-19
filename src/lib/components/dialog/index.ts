// Dialog component with namespace pattern
// Usage: <Dialog.Root>, <Dialog.Trigger>, <Dialog.Portal>, <Dialog.Overlay>, <Dialog.Content>

import * as DialogParts from './index.parts.ts';

// Named export for namespace usage: import { Dialog } from '...'
export const Dialog = DialogParts;

// Default export for backwards compatibility
export default DialogParts;

// Re-export individual parts for direct imports
export { default as DialogRoot } from './root/dialog-root.svelte';
export { default as DialogTrigger } from './trigger/dialog-trigger.svelte';
export { default as DialogPortal } from './portal/dialog-portal.svelte';
export { default as DialogOverlay } from './overlay/dialog-overlay.svelte';
export { default as DialogContent } from './content/dialog-content.svelte';

// Re-export context utilities
export { getDialogContext, setDialogContext, type DialogContext } from './root/context';
export type { DialogStateHelpers } from './root/dialog-root.svelte';
