import type { ComponentProps } from 'svelte';
import type SelectItemIndicatorComponent from './item-indicator/select-item-indicator.svelte';
import type SelectItemComponent from './item/select-item.svelte';
import type SelectLabelComponent from './label/select-label.svelte';
import type SelectListComponent from './list/select-list.svelte';
import type SelectPopoverComponent from './popover/select-popover.svelte';
import type SelectRootComponent from './root/select-root.svelte';
import type SelectTriggerComponent from './trigger/select-trigger.svelte';
import type SelectValueComponent from './value/select-value.svelte';

// Namespace export for component composition: <Select.Root>, <Select.Trigger>, etc.
export * as Select from './index.parts.js';

// Direct named exports for individual imports
export { default as SelectRoot } from './root/select-root.svelte';
export { default as SelectLabel } from './label/select-label.svelte';
export { default as SelectTrigger } from './trigger/select-trigger.svelte';
export { default as SelectValue } from './value/select-value.svelte';
export { default as SelectPopover } from './popover/select-popover.svelte';
export { default as SelectList } from './list/select-list.svelte';
export { default as SelectItem } from './item/select-item.svelte';
export { default as SelectItemIndicator } from './item-indicator/select-item-indicator.svelte';
export type SelectRootProps = ComponentProps<typeof SelectRootComponent>;
export type SelectLabelProps = ComponentProps<typeof SelectLabelComponent>;
export type SelectTriggerProps = ComponentProps<typeof SelectTriggerComponent>;
export type SelectValueProps = ComponentProps<typeof SelectValueComponent>;
export type SelectPopoverProps = ComponentProps<typeof SelectPopoverComponent>;
export type SelectListProps = ComponentProps<typeof SelectListComponent>;
export type SelectItemProps = ComponentProps<typeof SelectItemComponent>;
export type SelectItemIndicatorProps = ComponentProps<typeof SelectItemIndicatorComponent>;

export type { SelectTriggerRenderState, SelectValueRenderState } from './types.js';

// Context and types
export {
	getSelectContext,
	setSelectContext,
	useSelectContext,
	type SelectContext,
	type SelectChangeReason,
	type SelectCloseReason,
	type SelectOpenChangeDetails,
	type SelectOpenReason,
	type SelectKey
} from './root/context.js';

// Default export as namespace object
import * as SelectParts from './index.parts.js';
export default SelectParts;
