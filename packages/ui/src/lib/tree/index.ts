export * as Tree from './index.parts.js';

export type {
	TreeEmptyStateRenderProps,
	TreeHeaderProps,
	TreeItemProps,
	TreeItemTransition,
	TreeChildrenProps,
	TreeLabelProps,
	TreeRootProps,
	TreeSectionProps,
	TreeSelectionPropagation,
	TreeTriggerProps,
	TreeCheckboxProps,
	TreeCheckboxIndicatorProps
} from './types.js';

export { collapseMotion, type CollapseMotionParams } from '../primitives/collapse-motion.js';

export { default as TreeRoot } from './root/tree-root.svelte';
export { default as TreeSection } from './section/tree-section.svelte';
export { default as TreeHeader } from './header/tree-header.svelte';
export { default as TreeItem } from './item/tree-item.svelte';
export { default as TreeChildren } from './children/tree-children.svelte';
export { default as TreeLabel } from './label/tree-label.svelte';
export { default as TreeTrigger } from './trigger/tree-trigger.svelte';
export { default as TreeCheckbox } from './checkbox/tree-checkbox.svelte';
export { default as TreeCheckboxIndicator } from './checkbox-indicator/tree-checkbox-indicator.svelte';

export {
	createTreeContext,
	getTreeContext,
	setTreeContext,
	useTreeContext,
	getTreeLevelContext,
	setTreeLevelContext,
	useTreeLevelContext,
	type CreateTreeContextOptions,
	type TreeContext,
	type TreeDisabledBehavior,
	type TreeNodeId,
	type TreeNodePressSource,
	type TreeSelectionBehavior,
	type TreeSelectionMode,
	type TreeNodeRegistration,
	type TreeSectionRegistration,
	type TreeVisibleNode,
	type TreeActionHandler
} from './root/context.svelte.js';

import * as TreeParts from './index.parts.js';
export default TreeParts;
