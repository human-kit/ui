<script lang="ts">
	import { TransferList } from '@human-kit/ui';

	type Permission = { id: string; name: string };

	const permissions: Permission[] = [
		{ id: 'read', name: 'Read' },
		{ id: 'comment', name: 'Comment' },
		{ id: 'write', name: 'Write' },
		{ id: 'publish', name: 'Publish' },
		{ id: 'admin', name: 'Administer' }
	];

	// Read is granted to everyone and cannot be taken away.
	const disabledKeys = ['read'];

	let value = $state<(string | number)[]>(['read']);

	// See the hero demo: after `outline-none`, a focus ring needs `outline-solid` too.
	const listClass =
		'flex h-44 flex-col gap-0.5 overflow-y-auto border border-neutral-200 p-1 outline-none ' +
		'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 ' +
		'focus-visible:outline-neutral-900 dark:border-neutral-800 dark:focus-visible:outline-white';

	const itemClass =
		'flex cursor-default items-center px-2 py-1.5 text-sm text-neutral-700 outline-none select-none ' +
		'data-hovered:bg-neutral-100 data-selected:bg-neutral-900 data-selected:text-white ' +
		'data-disabled:cursor-not-allowed data-disabled:opacity-40 ' +
		'data-focus-visible:outline-solid data-focus-visible:outline-2 ' +
		'data-focus-visible:-outline-offset-2 data-focus-visible:outline-neutral-900 ' +
		'data-selected:data-focus-visible:outline-white ' +
		'dark:text-neutral-200 dark:data-hovered:bg-neutral-800 dark:data-selected:bg-white ' +
		'dark:data-selected:text-neutral-900 dark:data-focus-visible:outline-white ' +
		'dark:data-selected:data-focus-visible:outline-neutral-900';

	const buttonClass =
		'inline-flex h-8 w-8 items-center justify-center border border-neutral-200 text-sm ' +
		'text-neutral-700 transition-colors hover:bg-neutral-100 disabled:opacity-40 ' +
		'disabled:hover:bg-transparent outline-none focus-visible:outline-solid ' +
		'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ' +
		'dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800 ' +
		'dark:focus-visible:outline-white';
</script>

<TransferList.Root
	items={permissions}
	bind:value
	{disabledKeys}
	class="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-4"
>
	<TransferList.Source label="Available permissions" class={listClass}>
		{#snippet children(permission: Permission)}
			<TransferList.Item item={permission} class={itemClass}>{permission.name}</TransferList.Item>
		{/snippet}
	</TransferList.Source>

	<div class="flex flex-col gap-2">
		<TransferList.MoveSelected to="target" class={buttonClass}>→</TransferList.MoveSelected>
		<TransferList.MoveAll to="target" class={buttonClass}>⇥</TransferList.MoveAll>
		<TransferList.MoveAll to="source" class={buttonClass}>⇤</TransferList.MoveAll>
		<TransferList.MoveSelected to="source" class={buttonClass}>←</TransferList.MoveSelected>
	</div>

	<TransferList.Target label="Granted permissions" class={listClass}>
		{#snippet children(permission: Permission)}
			<TransferList.Item item={permission} class={itemClass}>{permission.name}</TransferList.Item>
		{/snippet}
	</TransferList.Target>

	<TransferList.Status />
</TransferList.Root>
