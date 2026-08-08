<script lang="ts">
	import { TransferList } from '@human-kit/ui';

	type Column = { id: string; name: string };

	const columns: Column[] = [
		{ id: 'name', name: 'Name' },
		{ id: 'email', name: 'Email' },
		{ id: 'role', name: 'Role' },
		{ id: 'team', name: 'Team' },
		{ id: 'status', name: 'Status' },
		{ id: 'created', name: 'Created at' },
		{ id: 'updated', name: 'Updated at' }
	];

	let value = $state<(string | number)[]>(['name', 'email']);

	// `outline-none` sets `--tw-outline-style: none` on the element, and the width utilities
	// read the style back out of that variable — so a focus ring has to say `outline-solid`
	// as well, or it is applied with no style and never paints.
	const listClass =
		'flex h-56 flex-col gap-0.5 overflow-y-auto border border-neutral-200 p-1 outline-none ' +
		'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 ' +
		'focus-visible:outline-neutral-900 dark:border-neutral-800 dark:focus-visible:outline-white';

	const itemClass =
		'flex cursor-default items-center px-2 py-1.5 text-sm text-neutral-700 outline-none select-none ' +
		'data-hovered:bg-neutral-100 data-selected:bg-neutral-900 data-selected:text-white ' +
		'data-disabled:cursor-not-allowed data-disabled:opacity-40 ' +
		'data-focus-visible:outline-solid data-focus-visible:outline-2 ' +
		'data-focus-visible:-outline-offset-2 data-focus-visible:outline-neutral-900 ' +
		// A selected row is already neutral-900, so the ring flips to stay visible on it.
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

	const headingClass = 'mb-2 text-xs font-medium tracking-wide text-neutral-500 uppercase';
</script>

<div class="w-full">
	<TransferList.Root
		items={columns}
		bind:value
		class="grid grid-cols-[1fr_auto_1fr] items-start gap-4"
	>
		<div>
			<p id="tl-available" class={headingClass}>Available</p>
			<TransferList.Source label="Available" aria-labelledby="tl-available" class={listClass}>
				{#snippet children(column: Column)}
					<TransferList.Item item={column} class={itemClass}>{column.name}</TransferList.Item>
				{/snippet}
			</TransferList.Source>
		</div>

		<div class="flex flex-col gap-2 pt-7">
			<TransferList.MoveSelected to="target" class={buttonClass}>→</TransferList.MoveSelected>
			<TransferList.MoveAll to="target" class={buttonClass}>⇥</TransferList.MoveAll>
			<TransferList.MoveAll to="source" class={buttonClass}>⇤</TransferList.MoveAll>
			<TransferList.MoveSelected to="source" class={buttonClass}>←</TransferList.MoveSelected>
		</div>

		<div>
			<p id="tl-selected" class={headingClass}>Selected</p>
			<TransferList.Target label="Selected" aria-labelledby="tl-selected" class={listClass}>
				{#snippet children(column: Column)}
					<TransferList.Item item={column} class={itemClass}>{column.name}</TransferList.Item>
				{/snippet}
			</TransferList.Target>
		</div>

		<TransferList.Status />
	</TransferList.Root>

	<p class="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
		Tab into a list, then <kbd>↑</kbd> <kbd>↓</kbd> to move the focus ring,
		<kbd>Space</kbd> to select, <kbd>Shift</kbd>+<kbd>↑</kbd> <kbd>↓</kbd> for a range.
	</p>
	<p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
		value: [{value.map((key) => `'${key}'`).join(', ')}]
	</p>
</div>
