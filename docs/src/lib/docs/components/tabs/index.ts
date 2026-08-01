import TabsIndicator from './indicator.svelte';
import TabsList from './list.svelte';
import TabsPanel from './panel.svelte';
import TabsRoot from './root.svelte';
import TabsTab from './tab.svelte';

export const Tabs = Object.assign(TabsRoot, {
	Root: TabsRoot,
	List: TabsList,
	Tab: TabsTab,
	Indicator: TabsIndicator,
	Panel: TabsPanel
});

export { tabsRecipe } from './recipe';
