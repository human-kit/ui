import type { ComponentProps } from 'svelte';
import type CollapsiblePanelComponent from './panel/collapsible-panel.svelte';
import type CollapsibleRootComponent from './root/collapsible-root.svelte';
import type CollapsibleTriggerComponent from './trigger/collapsible-trigger.svelte';

export * as Collapsible from './index.parts.js';

export { default as CollapsibleRoot } from './root/collapsible-root.svelte';
export { default as CollapsibleTrigger } from './trigger/collapsible-trigger.svelte';
export { default as CollapsiblePanel } from './panel/collapsible-panel.svelte';

export type CollapsibleRootProps = ComponentProps<typeof CollapsibleRootComponent>;
export type CollapsibleTriggerProps = ComponentProps<typeof CollapsibleTriggerComponent>;
export type CollapsiblePanelProps = ComponentProps<typeof CollapsiblePanelComponent>;

export {
	getCollapsibleContext,
	setCollapsibleContext,
	useCollapsibleContext,
	type CollapsibleContext
} from './root/context.js';

import * as CollapsibleParts from './index.parts.js';
export default CollapsibleParts;
