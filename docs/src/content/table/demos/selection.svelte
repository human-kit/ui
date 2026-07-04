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
		'group inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm outline-none transition-all hover:border-blue-400 data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-60 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[indeterminate=true]:border-amber-500 data-[indeterminate=true]:bg-amber-500 data-[indeterminate=true]:text-white dark:border-gray-600 dark:bg-gray-800 dark:text-white';
	const headerCellClass =
		'px-3 py-2 text-sm font-semibold text-gray-900 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-white';
	const cellClass =
		'px-3 py-2 text-sm text-gray-600 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-300';
</script>

{#snippet checkbox()}
	<Table.Checkbox class={checkboxClass}>
		<Table.CheckboxIndicator class="inline-flex h-3.5 w-3.5 items-center justify-center">
			<Check class="size-3.5 group-data-[indeterminate=true]:hidden" />
			<Minus class="size-3.5 group-data-[checked=true]:hidden" />
		</Table.CheckboxIndicator>
	</Table.Checkbox>
{/snippet}

<div class="w-full space-y-3">
	<div
		class="overflow-x-auto rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
	>
		<Table.Root
			aria-label="Users table"
			selectionMode="multiple"
			disabledKeys={['nora']}
			bind:selectedKeys
			class="min-w-full border-collapse text-left"
		>
			<Table.Header>
				<Table.Row class="border-b border-gray-200 dark:border-gray-700">
					<Table.Column id="selection" textValue="Selection" width={56}>
						<Table.ColumnHeaderCell class="w-12 px-3 py-2 text-center">
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
						class="border-b border-gray-100 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 data-disabled:opacity-60 data-selected:bg-blue-50 dark:border-gray-800 dark:data-selected:bg-blue-950/40"
					>
						<Table.Cell class="w-12 px-3 py-2 text-center">
							{@render checkbox()}
						</Table.Cell>
						<Table.Cell
							class="px-3 py-2 text-sm font-medium text-gray-900 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-white"
						>
							{user.email}
						</Table.Cell>
						<Table.Cell class={cellClass}>{user.group}</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	<p class="text-xs text-gray-500 dark:text-gray-400">
		selected: {[...selectedKeys].join(', ') || 'none'}
	</p>
</div>
