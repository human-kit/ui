<script lang="ts">
	import { Tree } from '@human-kit/ui';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	type Node = { id: string; title: string; children?: Node[] };

	const files: Node[] = [
		{
			id: 'documents',
			title: 'Documents',
			children: [
				{ id: 'reports', title: 'Reports', children: [{ id: 'weekly', title: 'Weekly report' }] },
				{ id: 'contracts', title: 'Contracts' }
			]
		},
		{ id: 'photos', title: 'Photos', children: [{ id: 'vacation', title: 'Vacation' }] },
		{ id: 'archive', title: 'Archive' }
	];

	const itemClass =
		'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-sm font-medium text-gray-700 outline-none transition-colors hover:bg-gray-100 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-selected:bg-blue-100 data-selected:text-blue-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:data-selected:bg-blue-500/20 dark:data-selected:text-blue-200';
</script>

{#snippet node(item: Node)}
	<Tree.Item id={item.id} title={item.title} class={itemClass}>
		{#if item.children?.length}
			<Tree.Trigger
				aria-label={`Toggle ${item.title}`}
				class="group inline-flex size-6 shrink-0 items-center justify-center rounded text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
			>
				<ChevronRight class="size-4 transition-transform group-data-expanded:rotate-90" />
			</Tree.Trigger>
		{:else}
			<span class="size-6 shrink-0"></span>
		{/if}
		<Tree.Label>{item.title}</Tree.Label>
		{#if item.children?.length}
			<Tree.Children class="mt-1 space-y-1">
				{#each item.children as child (child.id)}
					{@render node(child)}
				{/each}
			</Tree.Children>
		{/if}
	</Tree.Item>
{/snippet}

<Tree.Root
	aria-label="Project files"
	selectionMode="single"
	defaultExpandedKeys={['documents', 'reports']}
	defaultSelectedKeys={['weekly']}
	class="w-full max-w-sm space-y-1"
>
	{#each files as item (item.id)}
		{@render node(item)}
	{/each}
</Tree.Root>
