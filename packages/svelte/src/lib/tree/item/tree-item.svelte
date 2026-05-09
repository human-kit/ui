<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import {
		setTreeLevelContext,
		useTreeContext,
		useTreeLevelContext,
		type TreeNodeId
	} from '../root/context';
	import { getTreeRenderMode } from '../root/render-mode';
	import { getTreeItemBuildContext, setTreeItemBuildContext } from './build-context';
	import type { TreeItemProps } from '../types';

	let {
		id,
		value,
		title,
		textValue,
		isDisabled = false,
		children,
		class: className = '',
		...restProps
	}: TreeItemProps = $props();

	const tree = useTreeContext();
	const levelContext = useTreeLevelContext();
	const renderMode = getTreeRenderMode();
	const parentCollector = getTreeItemBuildContext();

	let hasChildItems = false;

	const resolvedId: TreeNodeId = untrack(() =>
		id !== undefined
			? id
			: value && typeof value === 'object' && 'id' in value
				? (value as { id: TreeNodeId }).id
				: tree.createGeneratedId('tree-item')
	);
	const parentId = untrack(() => levelContext.parentId);
	const sectionId = untrack(() => levelContext.sectionId);
	const level = untrack(() => levelContext.level);
	const resolvedTextValue = $derived(
		textValue ?? title ?? (typeof value === 'string' ? value : undefined) ?? String(resolvedId)
	);

	if (renderMode === 'collect') {
		parentCollector?.markHasChildren();
	}

	setTreeLevelContext({
		parentId: resolvedId,
		sectionId,
		level: level + 1
	});

	setTreeItemBuildContext({
		markHasChildren: () => {
			hasChildItems = true;
		}
	});

	function syncNodeRegistration() {
		tree.registerNode({
			id: resolvedId,
			parentId,
			sectionId,
			level,
			textValue: resolvedTextValue,
			disabled: isDisabled,
			hasChildren: hasChildItems,
			render: children,
			className,
			domProps: restProps
		});
	}

	function registerNodeAfterChildren() {
		syncNodeRegistration();
		return '';
	}

	onDestroy(() => {
		tree.unregisterNode(resolvedId);
	});
</script>

{#if renderMode === 'collect'}
	{#if children}
		{@render children()}
	{/if}
	{registerNodeAfterChildren()}
{/if}
