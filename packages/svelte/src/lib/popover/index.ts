// Namespace export for component composition: <Popover.Root>, <Popover.Trigger>, etc.
export * as Popover from './index.parts.ts';

// Direct named exports for individual imports
export { default as PopoverRoot } from './root/popover-root.svelte';
export { default as PopoverContent } from './content/popover-content.svelte';
export { default as PopoverTrigger } from './trigger/popover-trigger.svelte';
export { default as PopoverTriggerButton } from './trigger/popover-trigger-button.svelte';

// Context and types
export {
	getPopoverContext,
	setPopoverContext,
	type PopoverContext,
	type PopoverCanonicalCloseReason,
	type PopoverCloseReason,
	type PopoverOpenReason,
	type PopoverChangeReason,
	type PopoverOpenChangeDetails
} from './root/context.ts';

// Default export as namespace object
import * as PopoverParts from './index.parts.ts';
export default PopoverParts;
