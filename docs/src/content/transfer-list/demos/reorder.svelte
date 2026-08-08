<script lang="ts">
	import { TransferList } from '@human-kit/ui';

	type Column = { id: string; name: string };

	const columns: Column[] = [
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{ id: 'role', name: 'Role' },
		{ id: 'team', name: 'Team' },
		{ id: 'status', name: 'Status' }
	];

	let value = $state<(string | number)[]>(['name', 'role', 'email']);

	const listClass =
		'flex h-44 flex-col gap-0.5 overflow-y-auto border border-neutral-200 p-1 outline-none ' +
		'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 ' +
		'focus-visible:outline-neutral-900 dark:border-neutral-800 dark:focus-visible:outline-white';

	const itemClass =
		'flex cursor-default items-center px-2 py-1.5 text-sm text-neutral-700 outline-none select-none ' +
		'data-hovered:bg-neutral-100 data-selected:bg-neutral-900 data-selected:text-white ' +
		'data-focus-visible:outline-solid data-focus-visible:outline-2 ' +
		'data-focus-visible:-outline-offset-2 data-focus-visible:outline-neutral-900 ' +
		'data-selected:data-focus-visible:outline-white ' +
		'dark:text-neutral-200 dark:data-hovered:bg-neutral-800 dark:data-selected:bg-white ' +
		'dark:data-selected:text-neutral-900 dark:data-focus-visible:outline-white ' +
		'dark:data-selected:data-focus-visible:outline-neutral-900';

	const buttonClass =
		'inline-flex h-8 w-8 items-center justify-center border border-neutral-200 text-sm ' +
		'text-neutral-700 transition-colors hover:bg-neutral-100 aria-disabled:cursor-not-allowed ' +
		'aria-disabled:opacity-40 aria-disabled:hover:bg-transparent outline-none focus-visible:outline-solid ' +
		'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 ' +
		'dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800 ' +
		'dark:focus-visible:outline-white';
</script>

<div class="w-full">
	<TransferList.Root
		items={columns}
		bind:value
		name="columns"
		class="grid grid-cols-[1fr_auto_1fr_auto] items-center gap-4"
	>
		<TransferList.Source label="Available columns" class={listClass}>
			{#snippet children(column: Column)}
				<TransferList.Item item={column} class={itemClass}>{column.name}</TransferList.Item>
			{/snippet}
		</TransferList.Source>

		<div class="flex flex-col gap-2">
			<TransferList.MoveSelected to="target" class={buttonClass}>→</TransferList.MoveSelected>
			<TransferList.MoveSelected to="source" class={buttonClass}>←</TransferList.MoveSelected>
		</div>

		<TransferList.Target label="Visible columns" class={listClass}>
			{#snippet children(column: Column)}
				<TransferList.Item item={column} class={itemClass}>{column.name}</TransferList.Item>
			{/snippet}
		</TransferList.Target>

		<div class="flex flex-col gap-2">
			<TransferList.MoveUp class={buttonClass}>↑</TransferList.MoveUp>
			<TransferList.MoveDown class={buttonClass}>↓</TransferList.MoveDown>
		</div>

		<TransferList.Status />
	</TransferList.Root>

	<p class="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
		Submitted as <code>columns={value.join(', ')}</code> — one hidden input per column, in this order.
	</p>
</div>
