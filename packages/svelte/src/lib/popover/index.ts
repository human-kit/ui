import type { ComponentProps } from 'svelte';
import type PopoverContentComponent from './content/popover-content.svelte';
import type PopoverRootComponent from './root/popover-root.svelte';
import type PopoverTriggerComponent from './trigger/popover-trigger.svelte';

// Namespace export for component composition: <Popover.Root>, <Popover.Trigger>, etc.
export * as Popover from './index.parts.js';

// Direct named exports for individual imports
export { default as PopoverRoot } from './root/popover-root.svelte';
export { default as PopoverContent } from './content/popover-content.svelte';
export { default as PopoverTrigger } from './trigger/popover-trigger.svelte';
export type PopoverRootProps = ComponentProps<typeof PopoverRootComponent>;
export type PopoverContentProps = ComponentProps<typeof PopoverContentComponent>;
export type PopoverTriggerProps = ComponentProps<typeof PopoverTriggerComponent>;

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
} from './root/context.js';

// Default export as namespace object
import * as PopoverParts from './index.parts.js';
export default PopoverParts;
