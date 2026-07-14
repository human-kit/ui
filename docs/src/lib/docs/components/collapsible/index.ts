import CollapsiblePanel from './panel.svelte';
import CollapsibleRoot from './root.svelte';
import CollapsibleTrigger from './trigger.svelte';

export const Collapsible = Object.assign(CollapsibleRoot, {
	Root: CollapsibleRoot,
	Trigger: CollapsibleTrigger,
	Panel: CollapsiblePanel
});

export { CollapsiblePanel, CollapsibleRoot, CollapsibleTrigger };
export { collapsibleRecipe } from './recipe';
