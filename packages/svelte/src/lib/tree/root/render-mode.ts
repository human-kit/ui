import { getContext, setContext } from 'svelte';

const TREE_RENDER_MODE_KEY = Symbol('tree-render-mode');

export type TreeRenderMode = 'collect' | 'display';

export function setTreeRenderMode(mode: TreeRenderMode) {
	setContext(TREE_RENDER_MODE_KEY, mode);
	return mode;
}

export function getTreeRenderMode() {
	return getContext<TreeRenderMode | undefined>(TREE_RENDER_MODE_KEY) ?? 'display';
}
