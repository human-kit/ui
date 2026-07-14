<script lang="ts">
	import { untrack } from 'svelte';
	import Tree from '../index';

	type TreeNode = {
		id: string;
		title: string;
		children?: TreeNode[];
	};

	const nodes: TreeNode[] = [
		{
			id: 'documents',
			title: 'Documents',
			children: [
				{
					id: 'reports',
					title: 'Reports',
					children: [{ id: 'weekly-report', title: 'Weekly report' }]
				}
			]
		}
	];

	let selectedKeys = $state(untrack(() => new Set<string | number>(['weekly-report'])));
	let expandedKeys = $state(untrack(() => new Set<string | number>(['documents', 'reports'])));
</script>

{#snippet rowContent(id: string, title: string, hasChildren: boolean)}
	{#if hasChildren}
		<Tree.Trigger class="trigger" aria-label={`Toggle ${title}`} data-testid={`trigger-${id}`}>
			Toggle
		</Tree.Trigger>
	{/if}

	<Tree.Checkbox aria-label={`Select ${title}`} data-testid={`checkbox-${id}`}>
		<Tree.CheckboxIndicator>
			<span data-testid={`indicator-${id}`}>checked</span>
		</Tree.CheckboxIndicator>
	</Tree.Checkbox>

	<Tree.Label>{title}</Tree.Label>
{/snippet}

{#snippet renderTreeNode(node: TreeNode)}
	{#if node.children?.length}
		<Tree.Item id={node.id} title={node.title}>
			{@render rowContent(node.id, node.title, true)}
			<Tree.Children>
				{#each node.children as child (child.id)}
					{@render renderTreeNode(child)}
				{/each}
			</Tree.Children>
		</Tree.Item>
	{:else}
		<Tree.Item id={node.id} title={node.title}>
			{@render rowContent(node.id, node.title, false)}
		</Tree.Item>
	{/if}
{/snippet}

<Tree.Root
	aria-label="SSR tree"
	selectionMode="multiple"
	selectionPropagation="none"
	bind:expandedKeys
	bind:selectedKeys
>
	{#each nodes as node (node.id)}
		{@render renderTreeNode(node)}
	{/each}
</Tree.Root>
