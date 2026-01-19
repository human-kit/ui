// Namespace export for component composition: <ComboBox.Root>, <ComboBox.Input>, etc.
export * as ComboBox from './index.parts.ts';

// Direct named exports for individual imports
export { default as ComboBoxRoot } from './root/combobox.svelte';
export { default as ComboBoxInput } from './input/combobox-input.svelte';
export { default as ComboBoxButton } from './button/combobox-button.svelte';
export { default as ComboBoxPopover } from './popover/combobox-popover.svelte';
export { default as ComboBoxList } from './list/combobox-listbox.svelte';
export { default as ComboBoxItem } from './item/combobox-listboxitem.svelte';

// Context and types
export {
  getComboBoxContext,
  setComboBoxContext,
  useComboBoxContext,
  type ComboBoxContext
} from './root/context.ts';

// Default export with subcomponents attached (legacy pattern)
import Root from './root/combobox.svelte';
import Input from './input/combobox-input.svelte';
import Button from './button/combobox-button.svelte';
import Popover from './popover/combobox-popover.svelte';
import List from './list/combobox-listbox.svelte';
import Item from './item/combobox-listboxitem.svelte';

export default Object.assign(Root, {
  Input,
  Button,
  Popover,
  List,
  Item
});
