import type { ComponentProps } from 'svelte';
import type ListBoxItemComponent from './item/listbox-item.svelte';
import type ListBoxRootComponent from './root/listbox.svelte';

// Namespace export for component composition: <ListBox.Root>, <ListBox.Item>
export * as ListBox from './index.parts.js';

// Direct named exports for individual imports
export { default as ListBoxRoot } from './root/listbox.svelte';
export { default as ListBoxItem } from './item/listbox-item.svelte';
export type ListBoxRootProps = ComponentProps<typeof ListBoxRootComponent>;
export type ListBoxItemProps = ComponentProps<typeof ListBoxItemComponent>;

// Context and types
export { useListBoxContext, createListBoxContext, type ListBoxContext } from './root/context.js';

// Default export as namespace object
import * as ListBoxParts from './index.parts.js';
export default ListBoxParts;
