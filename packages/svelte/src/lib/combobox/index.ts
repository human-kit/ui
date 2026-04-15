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
