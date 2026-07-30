<script lang="ts">
	import { Table, type TableSelectionKey } from '@human-kit/ui';
	import Check from '@lucide/svelte/icons/check';
	import Minus from '@lucide/svelte/icons/minus';

	const users = [
		{ id: 'danilo', email: 'danilo@example.com', group: 'Developer' },
		{ id: 'zahra', email: 'zahra@example.com', group: 'Admin' },
		{ id: 'jasper', email: 'jasper@example.com', group: 'Developer' },
		{ id: 'marta', email: 'marta@example.com', group: 'Support' },
		{ id: 'nora', email: 'nora@example.com', group: 'Finance' }
	];

	let selectedKeys = $state<Set<TableSelectionKey>>(new Set(['danilo']));

	const checkboxClass =
		'group inline-flex size-4 shrink-0 items-center justify-center align-middle border border-neutral-300 bg-white text-neutral-900 outline-none transition-all hover:border-neutral-400 data-[checked=true]:border-neutral-900 data-[checked=true]:bg-neutral-900 data-[checked=true]:text-white data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:-outline-offset-2 data-[focus-visible=true]:outline-neutral-900 data-[indeterminate=true]:border-neutral-900 data-[indeterminate=true]:bg-neutral-900 data-[indeterminate=true]:text-white dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:data-[checked=true]:border-white dark:data-[checked=true]:bg-white dark:data-[checked=true]:text-neutral-900 dark:data-[indeterminate=true]:border-white dark:data-[indeterminate=true]:bg-white dark:data-[indeterminate=true]:text-neutral-900 dark:data-[focus-visible=true]:outline-white';
	const headerCellClass =
		'px-3 py-1.5 text-sm text-neutral-900 outline-none data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:-outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-white dark:data-[focus-visible=true]:outline-white';
	const cellClass =
		'px-3 py-1.5 text-sm text-neutral-600 outline-none data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:-outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-neutral-300 dark:data-[focus-visible=true]:outline-white';
</script>

{#snippet checkbox()}
	<Table.Checkbox class={checkboxClass}>
		<Table.CheckboxIndicator class="inline-flex size-3 items-center justify-center">
			<Check class="size-3 group-data-[indeterminate=true]:hidden" />
			<Minus class="size-3 group-data-[checked=true]:hidden" />
		</Table.CheckboxIndicator>
	</Table.Checkbox>
{/snippet}

<div class="w-full">
	<div
		class="overflow-x-auto border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
	>
		<Table.Root
			aria-label="Users table"
			selectionMode="multiple"
			disabledKeys={['nora']}
			bind:selectedKeys
			class="min-w-full border-collapse text-left [&_td]:border-0 [&_th]:border-0 [&_tbody_th]:font-medium [&_thead_th]:font-normal"
		>
			<Table.Header>
				<Table.Row class="border-b border-neutral-200 dark:border-neutral-800">
					<Table.Column id="selection" textValue="Selection" width={56}>
						<Table.ColumnHeaderCell class="w-12 px-3 py-1.5 text-center">
							{@render checkbox()}
						</Table.ColumnHeaderCell>
					</Table.Column>
					<Table.Column id="email" rowHeader>
						<Table.ColumnHeaderCell class={headerCellClass}>Email</Table.ColumnHeaderCell>
					</Table.Column>
					<Table.Column id="group">
						<Table.ColumnHeaderCell class={headerCellClass}>Group</Table.ColumnHeaderCell>
					</Table.Column>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each users as user (user.id)}
					<Table.Row
						id={user.id}
						class="border-b border-neutral-100 outline-none last:border-b-0 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:-outline-offset-2 data-[focus-visible=true]:outline-neutral-900 data-disabled:opacity-60 data-selected:bg-neutral-100 dark:border-neutral-800 dark:data-selected:bg-neutral-800 dark:data-[focus-visible=true]:outline-white"
					>
						<Table.Cell class="w-12 px-3 py-1.5 text-center">
							{@render checkbox()}
						</Table.Cell>
						<Table.Cell
							class="px-3 py-1.5 text-sm font-medium text-neutral-900 outline-none data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:-outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:text-white dark:data-[focus-visible=true]:outline-white"
						>
							{user.email}
						</Table.Cell>
						<Table.Cell class={cellClass}>{user.group}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
