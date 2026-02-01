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
	// Legacy aliases
	getPopoverTriggerContext,
	setPopoverTriggerContext,
	type PopoverTriggerContext
} from './root/context.ts';

// Default export with subcomponents attached (legacy pattern)
import Root from './root/popover-root.svelte';
import Content from './content/popover-content.svelte';
import Trigger from './trigger/popover-trigger.svelte';
import TriggerButton from './trigger/popover-trigger-button.svelte';

export default Object.assign(Root, {
	Content,
	Trigger,
	TriggerButton
});
