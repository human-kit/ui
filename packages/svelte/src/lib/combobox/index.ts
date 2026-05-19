import type { ComponentProps } from 'svelte';
import type ComboBoxButtonComponent from './button/combobox-button.svelte';
import type ComboBoxClearComponent from './clear/combobox-clear.svelte';
import type ComboBoxInputComponent from './input/combobox-input.svelte';
import type ComboBoxItemIndicatorComponent from './item-indicator/combobox-item-indicator.svelte';
import type ComboBoxItemComponent from './item/combobox-listboxitem.svelte';
import type ComboBoxListComponent from './list/combobox-listbox.svelte';
import type ComboBoxPopoverComponent from './popover/combobox-popover.svelte';
import type ComboBoxRootComponent from './root/combobox.svelte';
import type ComboBoxTagRemoveComponent from './tag-remove/combobox-tag-remove.svelte';
import type ComboBoxTagComponent from './tag/combobox-tag.svelte';
import type ComboBoxTagsComponent from './tags/combobox-tags.svelte';
import type ComboBoxTriggerComponent from './trigger/combobox-trigger.svelte';

// Namespace export for component composition: <ComboBox.Root>, <ComboBox.Input>, etc.
export * as ComboBox from './index.parts.js';

// Direct named exports for individual imports
export { default as ComboBoxRoot } from './root/combobox.svelte';
export { default as ComboBoxInput } from './input/combobox-input.svelte';
export { default as ComboBoxTrigger } from './trigger/combobox-trigger.svelte';
export { default as ComboBoxButton } from './button/combobox-button.svelte';
export { default as ComboBoxClear } from './clear/combobox-clear.svelte';
export { default as ComboBoxPopover } from './popover/combobox-popover.svelte';
export { default as ComboBoxList } from './list/combobox-listbox.svelte';
export { default as ComboBoxItem } from './item/combobox-listboxitem.svelte';
export { default as ComboBoxItemIndicator } from './item-indicator/combobox-item-indicator.svelte';
export { default as ComboBoxTags } from './tags/combobox-tags.svelte';
export { default as ComboBoxTag } from './tag/combobox-tag.svelte';
export { default as ComboBoxTagRemove } from './tag-remove/combobox-tag-remove.svelte';
export type ComboBoxRootProps = ComponentProps<typeof ComboBoxRootComponent>;
export type ComboBoxInputProps = ComponentProps<typeof ComboBoxInputComponent>;
export type ComboBoxTriggerProps = ComponentProps<typeof ComboBoxTriggerComponent>;
export type ComboBoxButtonProps = ComponentProps<typeof ComboBoxButtonComponent>;
export type ComboBoxClearProps = ComponentProps<typeof ComboBoxClearComponent>;
export type ComboBoxPopoverProps = ComponentProps<typeof ComboBoxPopoverComponent>;
export type ComboBoxListProps = ComponentProps<typeof ComboBoxListComponent>;
export type ComboBoxItemProps = ComponentProps<typeof ComboBoxItemComponent>;
export type ComboBoxItemIndicatorProps = ComponentProps<typeof ComboBoxItemIndicatorComponent>;
export type ComboBoxTagsProps = ComponentProps<typeof ComboBoxTagsComponent>;
export type ComboBoxTagProps = ComponentProps<typeof ComboBoxTagComponent>;
export type ComboBoxTagRemoveProps = ComponentProps<typeof ComboBoxTagRemoveComponent>;

// Context and types
export {
	getComboBoxContext,
	setComboBoxContext,
	useComboBoxContext,
	type ComboBoxContext
} from './root/context.js';

// Default export as namespace object
import * as ComboBoxParts from './index.parts.js';
export default ComboBoxParts;
