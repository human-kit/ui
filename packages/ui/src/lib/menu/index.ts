import type { ComponentProps } from 'svelte';
import type MenuRootComponent from './root/menu-root.svelte';
import type MenuTriggerComponent from './trigger/menu-trigger.svelte';
import type MenuContentComponent from './content/menu-content.svelte';
import type MenuOverlayComponent from './overlay/menu-overlay.svelte';
import type MenuItemComponent from './item/menu-item.svelte';
import type MenuSeparatorComponent from './separator/menu-separator.svelte';
import type MenuGroupComponent from './group/menu-group.svelte';
import type MenuGroupLabelComponent from './group/menu-group-label.svelte';
import type MenuSubmenuRootComponent from './submenu/menu-submenu-root.svelte';
import type MenuSubmenuTriggerComponent from './submenu/menu-submenu-trigger.svelte';

// Namespace export for component composition: <Menu.Root>, <Menu.Trigger>, etc.
export * as Menu from './index.parts.js';

// Direct named exports for individual imports
export { default as MenuRoot } from './root/menu-root.svelte';
export { default as MenuTrigger } from './trigger/menu-trigger.svelte';
export { default as MenuContent } from './content/menu-content.svelte';
export { default as MenuOverlay } from './overlay/menu-overlay.svelte';
export { default as MenuItem } from './item/menu-item.svelte';
export { default as MenuSeparator } from './separator/menu-separator.svelte';
export { default as MenuGroup } from './group/menu-group.svelte';
export { default as MenuGroupLabel } from './group/menu-group-label.svelte';
export { default as MenuSubmenuRoot } from './submenu/menu-submenu-root.svelte';
export { default as MenuSubmenuTrigger } from './submenu/menu-submenu-trigger.svelte';
export type MenuRootProps = ComponentProps<typeof MenuRootComponent>;
export type MenuTriggerProps = ComponentProps<typeof MenuTriggerComponent>;
export type MenuContentProps = ComponentProps<typeof MenuContentComponent>;
export type MenuOverlayProps = ComponentProps<typeof MenuOverlayComponent>;
export type MenuItemProps = ComponentProps<typeof MenuItemComponent>;
export type MenuSeparatorProps = ComponentProps<typeof MenuSeparatorComponent>;
export type MenuGroupProps = ComponentProps<typeof MenuGroupComponent>;
export type MenuGroupLabelProps = ComponentProps<typeof MenuGroupLabelComponent>;
export type MenuSubmenuRootProps = ComponentProps<typeof MenuSubmenuRootComponent>;
export type MenuSubmenuTriggerProps = ComponentProps<typeof MenuSubmenuTriggerComponent>;

// Context and types
export {
	getMenuContext,
	setMenuContext,
	useMenuContext,
	type MenuContext,
	type MenuItemData,
	type MenuCanonicalCloseReason,
	type MenuCloseReason,
	type MenuOpenReason,
	type MenuChangeReason,
	type MenuOpenChangeDetails,
	type MenuOpenFocusIntent
} from './root/context.js';

// Default export as namespace object
import * as MenuParts from './index.parts.js';
export default MenuParts;
