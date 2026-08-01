// Dialog component with namespace pattern
// Usage: <Dialog.Root>, <Dialog.Trigger>, <Dialog.Portal>, <Dialog.Overlay>, <Dialog.Content>

import type { ComponentProps } from 'svelte';
import type DialogContentComponent from './content/dialog-content.svelte';
import type DialogOverlayComponent from './overlay/dialog-overlay.svelte';
import type DialogPortalComponent from './portal/dialog-portal.svelte';
import type DialogRootComponent from './root/dialog-root.svelte';
import type DialogTriggerComponent from './trigger/dialog-trigger.svelte';
import type DialogTitleComponent from './title/dialog-title.svelte';
import type DialogDescriptionComponent from './description/dialog-description.svelte';
import type DialogCloseComponent from './close/dialog-close.svelte';
import * as DialogParts from './index.parts.js';

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
export { default as DialogTitle } from './title/dialog-title.svelte';
export { default as DialogDescription } from './description/dialog-description.svelte';
export { default as DialogClose } from './close/dialog-close.svelte';
export type DialogTitleProps = ComponentProps<typeof DialogTitleComponent>;
export type DialogDescriptionProps = ComponentProps<typeof DialogDescriptionComponent>;
export type DialogCloseProps = ComponentProps<typeof DialogCloseComponent>;
export type DialogRootProps = ComponentProps<typeof DialogRootComponent>;
export type DialogTriggerProps = ComponentProps<typeof DialogTriggerComponent>;
export type DialogPortalProps = ComponentProps<typeof DialogPortalComponent>;
export type DialogOverlayProps = ComponentProps<typeof DialogOverlayComponent>;
export type DialogContentProps = ComponentProps<typeof DialogContentComponent>;

// Re-export context utilities
export { getDialogContext, setDialogContext, type DialogContext } from './root/context.js';
export type { DialogStateHelpers } from './root/types.js';
