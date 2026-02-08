// Namespace export for component composition: <ListBox.Root>, <ListBox.Item>
export * as ListBox from './index.parts.ts';

// Direct named exports for individual imports
export { default as ListBoxRoot } from './root/listbox.svelte';
export { default as ListBoxItem } from './item/listbox-item.svelte';

// Context and types
export { useListBoxContext, createListBoxContext, type ListBoxContext } from './root/context.ts';

// Default export as namespace object
import * as ListBoxParts from './index.parts.ts';
export default ListBoxParts;
