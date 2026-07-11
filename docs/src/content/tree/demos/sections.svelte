<script lang="ts">
	import { Tree } from '@human-kit/svelte-components';

	const itemClass =
		'flex w-full items-center gap-2 rounded-md py-1.5 pr-2 text-sm font-medium text-neutral-700 outline-none transition-colors hover:bg-neutral-100 data-focus-visible:ring-2 data-focus-visible:ring-blue-500 data-selected:bg-blue-100 data-selected:text-blue-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-selected:bg-blue-500/20 dark:data-selected:text-blue-200';
	const headerClass =
		'mb-1 pl-1 text-xs font-semibold tracking-widest text-neutral-500 uppercase dark:text-neutral-400';
</script>

{#snippet row(id: string, title: string)}
	<Tree.Item {id} {title} class={itemClass}>
		<Tree.Label class="pl-1">{title}</Tree.Label>
	</Tree.Item>
{/snippet}

<Tree.Root aria-label="Workspace" selectionMode="single" class="w-full max-w-sm space-y-1">
	<Tree.Section aria-label="Files section" class="space-y-1">
		<Tree.Header class={headerClass}>Files</Tree.Header>
		{@render row('documents', 'Documents')}
		{@render row('photos', 'Photos')}
		{@render row('archive', 'Archive')}
	</Tree.Section>
	<Tree.Section aria-label="Inbox section" class="space-y-1">
		<Tree.Header class={`${headerClass} mt-4`}>Inbox</Tree.Header>
		{@render row('today', 'Today')}
		{@render row('scheduled', 'Scheduled')}
		{@render row('done', 'Done')}
	</Tree.Section>
</Tree.Root>
