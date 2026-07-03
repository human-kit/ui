import { getContext, setContext } from 'svelte';

const TREE_ITEM_BUILD_KEY = Symbol('tree-item-build');

export type TreeItemBuildContext = {
	markHasChildren: () => void;
};

export function setTreeItemBuildContext(context: TreeItemBuildContext) {
	setContext(TREE_ITEM_BUILD_KEY, context);
	return context;
}

export function getTreeItemBuildContext() {
	return getContext<TreeItemBuildContext | undefined>(TREE_ITEM_BUILD_KEY);
}

export function useTreeItemBuildContext() {
	const context = getTreeItemBuildContext();
	if (!context) {
		throw new Error('Tree.Children must be used within Tree.Item');
	}
	return context;
}
