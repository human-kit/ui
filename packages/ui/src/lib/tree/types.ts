import type { HTMLAttributes, HTMLButtonAttributes } from 'svelte/elements';
import type { Snippet } from 'svelte';
import type { TransitionConfig } from 'svelte/transition';
import type {
	TreeActionHandler,
	TreeContext,
	TreeDisabledBehavior,
	TreeNodeId,
	TreeSelectionBehavior,
	TreeSelectionMode
} from './root/context.svelte.js';

export type TreeSelectionPropagation = 'none' | 'descendants';

/**
 * A Svelte transition applied to each tree item row as it enters/leaves the visible set (i.e. when a
 * branch is expanded or collapsed). The library does not animate by default — pass one of these to
 * `Tree.Root`'s `itemTransition` to opt in. Compatible with `svelte/transition` functions (e.g.
 * `slide`, `fade`) and the bundled `collapseMotion` helper.
 */
export type TreeItemTransition = (
	node: Element,
	params: undefined,
	options: { direction: 'in' | 'out' | 'both' }
) => TransitionConfig;

export type TreeEmptyStateRenderProps = {
	empty: boolean;
};

export type TreeRootProps<T extends object = object> = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children'
> & {
	expandedKeys?: Iterable<TreeNodeId>;
	defaultExpandedKeys?: Iterable<TreeNodeId>;
	selectedKeys?: Iterable<TreeNodeId>;
	defaultSelectedKeys?: Iterable<TreeNodeId>;
	disabledKeys?: Iterable<TreeNodeId>;
	selectionMode?: TreeSelectionMode;
	selectionBehavior?: TreeSelectionBehavior;
	disabledBehavior?: TreeDisabledBehavior;
	selectionPropagation?: TreeSelectionPropagation;
	disallowEmptySelection?: boolean;
	items?: Iterable<T>;
	children?: Snippet | Snippet<[T]>;
	renderEmptyState?: Snippet<[TreeEmptyStateRenderProps]>;
	onExpandedKeysChange?: (keys: Set<TreeNodeId>) => void;
	onSelectionChange?: (keys: Set<TreeNodeId>) => void;
	onAction?: TreeActionHandler;
	/** Enter/exit transition applied to each item row on expand/collapse. Defaults to none. */
	itemTransition?: TreeItemTransition;
	class?: string;
	context?: TreeContext;
	element?: HTMLElement;
};

export type TreeItemProps<T = unknown> = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'id' | 'role' | 'tabindex'
> & {
	id?: TreeNodeId;
	value?: T;
	title?: string;
	textValue?: string;
	disabled?: boolean;
	children?: Snippet;
	class?: string;
};

export type TreeChildrenProps = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'class' | 'id' | 'role' | 'hidden' | 'aria-hidden'
> & {
	children?: Snippet;
	class?: string;
};

export type TreeLabelProps = Omit<HTMLAttributes<HTMLSpanElement>, 'children'> & {
	children?: Snippet;
	class?: string;
};

export type TreeTriggerProps = Omit<
	HTMLButtonAttributes,
	'type' | 'children' | 'class' | 'aria-expanded' | 'aria-controls' | 'disabled' | 'tabindex'
> & {
	children?: Snippet;
	class?: string;
};

export type TreeCheckboxProps = Omit<
	HTMLAttributes<HTMLSpanElement>,
	| 'children'
	| 'class'
	| 'id'
	| 'role'
	| 'tabindex'
	| 'aria-checked'
	| 'aria-disabled'
	| 'onclick'
	| 'onkeydown'
> & {
	id?: string;
	title?: string;
	children?: Snippet;
	class?: string;
	'aria-label'?: string;
	'aria-labelledby'?: string;
};

export type TreeCheckboxIndicatorProps = Omit<
	HTMLAttributes<HTMLSpanElement>,
	'children' | 'class'
> & {
	forceMount?: boolean;
	children?: Snippet;
	class?: string;
};

export type TreeSectionProps<T extends object = object> = Omit<
	HTMLAttributes<HTMLDivElement>,
	'children' | 'id'
> & {
	id?: TreeNodeId;
	value?: T;
	items?: Iterable<T>;
	children?: Snippet | Snippet<[T]>;
	class?: string;
};

export type TreeHeaderProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
	children?: Snippet;
	class?: string;
};
