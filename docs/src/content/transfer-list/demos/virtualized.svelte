<script lang="ts">
	import { TransferList } from '@human-kit/ui';

	type Row = { id: number; name: string };

	const rows: Row[] = Array.from({ length: 2000 }, (_, index) => ({
		id: index,
		name: `Record ${String(index).padStart(4, '0')}`
	}));

	let value = $state<(string | number)[]>([]);

	// Rows must all be the same height for the virtualizer to size the scrollbar without
	// measuring every one of them.
	const virtualizer = { rowHeight: 32, overscan: 8 };

	const listClass =
		'flex h-56 flex-col overflow-y-auto border border-neutral-200 outline-none ' +
		'focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 ' +
		'focus-visible:outline-neutral-900 dark:border-neutral-800 dark:focus-visible:outline-white';

	const itemClass =
		'flex h-8 cursor-default items-center px-2 text-sm text-neutral-700 outline-none select-none ' +
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
		items={rows}
		bind:value
		class="grid grid-cols-[1fr_auto_1fr] items-center gap-4"
	>
		<TransferList.Source label="All records" {virtualizer} class={listClass}>
			{#snippet children(row: Row)}
				<TransferList.Item item={row} class={itemClass}>{row.name}</TransferList.Item>
			{/snippet}
		</TransferList.Source>

		<div class="flex flex-col gap-2">
			<TransferList.MoveSelected to="target" class={buttonClass}>→</TransferList.MoveSelected>
			<TransferList.MoveSelected to="source" class={buttonClass}>←</TransferList.MoveSelected>
		</div>

		<TransferList.Target label="Picked records" {virtualizer} class={listClass}>
			{#snippet children(row: Row)}
				<TransferList.Item item={row} class={itemClass}>{row.name}</TransferList.Item>
			{/snippet}
		</TransferList.Target>

		<TransferList.Status />
	</TransferList.Root>

	<p class="mt-3 text-sm text-neutral-500 dark:text-neutral-400">
		2000 records, a handful of rows in the DOM. Click one, scroll a long way down, then Shift-click
		another — the range covers everything between, including the rows that were never rendered. {value.length}
		picked.
	</p>
</div>
