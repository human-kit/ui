// Namespace export for component composition: <ListBox.Root>, <ListBox.Item>
export * as ListBox from './index.parts.ts';

// Direct named exports for individual imports
export { default as ListBoxRoot } from './root/listbox.svelte';
export { default as ListBoxItem } from './item/listbox-item.svelte';

// Context and types
export {
  useListBoxContext,
  createListBoxContext,
  type ListBoxContext
} from './root/context.ts';

// Default export with subcomponents attached (legacy pattern)
import Root from './root/listbox.svelte';
import Item from './item/listbox-item.svelte';

export default Object.assign(Root, {
  Item
});
