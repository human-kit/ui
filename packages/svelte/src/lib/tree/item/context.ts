import { getContext, setContext } from 'svelte';
import type { TreeNodeId, TreeSelectionState } from '../root/context';

const TREE_ITEM_KEY = Symbol('tree-item');

export type TreeItemSelectionInteraction = {
	shiftKey?: boolean;
	ctrlKey?: boolean;
	metaKey?: boolean;
};

export type TreeItemContext = {
	id: TreeNodeId;
	level: number;
	getLabel: () => string;
	getTextValue: () => string;
	hasChildren: () => boolean;
	isExpanded: () => boolean;
	toggleExpansion: () => void;
	getSelectionState: () => TreeSelectionState;
	isSelected: () => boolean;
	isDisabled: () => boolean;
	isSelectionDisabled: () => boolean;
	isActionDisabled: () => boolean;
	setSelected: (selected: boolean) => void;
	pressSelection: (interaction?: TreeItemSelectionInteraction) => void;
	focusWithPointer: () => void;
	focusItem: () => void;
	getLabelId: () => string;
	getLabelElement: () => HTMLElement | undefined;
	setLabelElement: (element?: HTMLElement) => void;
	syncLabelText: () => void;
	getItemElement: () => HTMLElement | undefined;
	setItemElement: (element?: HTMLElement) => void;
};

export function setTreeItemContext(context: TreeItemContext) {
	setContext(TREE_ITEM_KEY, context);
	return context;
}

export function getTreeItemContext() {
	return getContext<TreeItemContext | undefined>(TREE_ITEM_KEY);
}

export function useTreeItemContext() {
	const context = getTreeItemContext();
	if (!context) {
		throw new Error('Tree parts must be used within Tree.Item');
	}
	return context;
}
