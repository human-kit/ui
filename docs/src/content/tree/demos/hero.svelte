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
		'flex w-full items-center gap-1.5 py-1 pr-2 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-neutral-100 data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-neutral-900 data-selected:bg-neutral-900 data-selected:text-white dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-selected:bg-white dark:data-selected:text-neutral-900 dark:data-focus-visible:outline-white';
</script>

{#snippet node(item: Node)}
	<Tree.Item id={item.id} title={item.title} class={itemClass}>
		{#if item.children?.length}
			<Tree.Trigger
				aria-label={`Toggle ${item.title}`}
				class="group inline-flex size-5 shrink-0 items-center justify-center text-current opacity-60 outline-none transition-opacity hover:opacity-100"
			>
				<ChevronRight class="size-3.5 transition-transform group-data-expanded:rotate-90" />
			</Tree.Trigger>
		{:else}
			<span class="size-5 shrink-0"></span>
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
