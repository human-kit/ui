// Drawer component with namespace pattern
// Usage: <Drawer.Root>, <Drawer.Trigger>, <Drawer.Portal>, <Drawer.Overlay>, <Drawer.Content>

import type { ComponentProps } from 'svelte';
import type DrawerRootComponent from './root/drawer-root.svelte';
import type DrawerTriggerComponent from './trigger/drawer-trigger.svelte';
import type DrawerPortalComponent from './portal/drawer-portal.svelte';
import type DrawerOverlayComponent from './overlay/drawer-overlay.svelte';
import type DrawerViewportComponent from './viewport/drawer-viewport.svelte';
import type DrawerContentComponent from './content/drawer-content.svelte';
import type DrawerBodyComponent from './body/drawer-body.svelte';
import type DrawerTitleComponent from './title/drawer-title.svelte';
import type DrawerDescriptionComponent from './description/drawer-description.svelte';
import type DrawerCloseComponent from './close/drawer-close.svelte';
import type DrawerSwipeAreaComponent from './swipe-area/drawer-swipe-area.svelte';
import type DrawerIndentComponent from './indent/drawer-indent.svelte';
import type DrawerIndentBackgroundComponent from './indent/drawer-indent-background.svelte';
import type DrawerVirtualKeyboardProviderComponent from './virtual-keyboard/drawer-virtual-keyboard-provider.svelte';
import * as DrawerParts from './index.parts.js';

// Named export for namespace usage: import { Drawer } from '...'
export const Drawer = DrawerParts;

export default DrawerParts;

// Re-export individual parts for direct imports
export { default as DrawerRoot } from './root/drawer-root.svelte';
export { default as DrawerTrigger } from './trigger/drawer-trigger.svelte';
export { default as DrawerPortal } from './portal/drawer-portal.svelte';
export { default as DrawerOverlay } from './overlay/drawer-overlay.svelte';
export { default as DrawerViewport } from './viewport/drawer-viewport.svelte';
export { default as DrawerContent } from './content/drawer-content.svelte';
export { default as DrawerBody } from './body/drawer-body.svelte';
export { default as DrawerTitle } from './title/drawer-title.svelte';
export { default as DrawerDescription } from './description/drawer-description.svelte';
export { default as DrawerClose } from './close/drawer-close.svelte';
export { default as DrawerSwipeArea } from './swipe-area/drawer-swipe-area.svelte';
export { default as DrawerIndent } from './indent/drawer-indent.svelte';
export { default as DrawerIndentBackground } from './indent/drawer-indent-background.svelte';
export { default as DrawerVirtualKeyboardProvider } from './virtual-keyboard/drawer-virtual-keyboard-provider.svelte';

export type DrawerRootProps = ComponentProps<typeof DrawerRootComponent>;
export type DrawerTriggerProps = ComponentProps<typeof DrawerTriggerComponent>;
export type DrawerPortalProps = ComponentProps<typeof DrawerPortalComponent>;
export type DrawerOverlayProps = ComponentProps<typeof DrawerOverlayComponent>;
export type DrawerViewportProps = ComponentProps<typeof DrawerViewportComponent>;
export type DrawerContentProps = ComponentProps<typeof DrawerContentComponent>;
export type DrawerBodyProps = ComponentProps<typeof DrawerBodyComponent>;
export type DrawerTitleProps = ComponentProps<typeof DrawerTitleComponent>;
export type DrawerDescriptionProps = ComponentProps<typeof DrawerDescriptionComponent>;
export type DrawerCloseProps = ComponentProps<typeof DrawerCloseComponent>;
export type DrawerSwipeAreaProps = ComponentProps<typeof DrawerSwipeAreaComponent>;
export type DrawerIndentProps = ComponentProps<typeof DrawerIndentComponent>;
export type DrawerIndentBackgroundProps = ComponentProps<typeof DrawerIndentBackgroundComponent>;
export type DrawerVirtualKeyboardProviderProps = ComponentProps<
	typeof DrawerVirtualKeyboardProviderComponent
>;

// Detached triggers
export { createDrawerHandle, type DrawerHandle } from './root/handle.svelte.js';

// Context utilities
export {
	getDrawerContext,
	setDrawerContext,
	requireDrawerContext,
	type DrawerContext
} from './root/context.js';
export type {
	DrawerSide,
	DrawerModal,
	DrawerCloseReason,
	DrawerSnapPoint,
	DrawerStateHelpers
} from './root/types.js';
