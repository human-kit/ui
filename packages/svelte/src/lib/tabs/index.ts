import type { ComponentProps } from 'svelte';
import type TabsIndicatorComponent from './indicator/tabs-indicator.svelte';
import type TabsListComponent from './list/tabs-list.svelte';
import type TabsPanelComponent from './panel/tabs-panel.svelte';
import type TabsRootComponent from './root/tabs-root.svelte';
import type TabsTabComponent from './tab/tabs-tab.svelte';

export * as Tabs from './index.parts.js';

export { default as TabsRoot } from './root/tabs-root.svelte';
export { default as TabsList } from './list/tabs-list.svelte';
export { default as TabsTab } from './tab/tabs-tab.svelte';
export { default as TabsIndicator } from './indicator/tabs-indicator.svelte';
export { default as TabsPanel } from './panel/tabs-panel.svelte';

export type TabsRootProps = ComponentProps<typeof TabsRootComponent>;
export type TabsListProps = ComponentProps<typeof TabsListComponent>;
export type TabsTabProps = ComponentProps<typeof TabsTabComponent>;
export type TabsIndicatorProps = ComponentProps<typeof TabsIndicatorComponent>;
export type TabsPanelProps = ComponentProps<typeof TabsPanelComponent>;

export {
	createTabsContext,
	getTabsContext,
	setTabsContext,
	useTabsContext,
	type CreateTabsContextOptions,
	type TabsActivationDirection,
	type TabsContext,
	type TabsKeyboardActivation,
	type TabsOrientation,
	type TabsValue
} from './root/context.js';

import * as TabsParts from './index.parts.js';
export default TabsParts;
