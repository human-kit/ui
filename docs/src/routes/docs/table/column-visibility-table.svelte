<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/svelte-components/table';
	import { workspaceMembers } from './table-demo-data';

	let directoryHiddenColumns = $state<string[]>(['lastSeen']);

	function toggleDirectoryColumn(columnId: string) {
		directoryHiddenColumns = directoryHiddenColumns.includes(columnId)
			? directoryHiddenColumns.filter((currentColumnId) => currentColumnId !== columnId)
			: [...directoryHiddenColumns, columnId];
	}
</script>

<DemoSection
	title="Column Visibility"
	description="A dedicated visibility demo using `bind:hiddenColumns`. The toggles are consumer UI; the table owns the visibility-aware layout and keyboard model."
>
	<div
		class="w-full rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
	>
		<Table.Root
			aria-label="Workspace member directory"
			selectionMode="none"
			bind:hiddenColumns={directoryHiddenColumns}
			class="min-w-full border-collapse text-left"
		>
			<Table.Header>
				<Table.Row class="border-b border-gray-200 dark:border-gray-700">
					{#each [{ id: 'name', label: 'Name', rowHeader: true }, { id: 'email', label: 'Email' }, { id: 'region', label: 'Region' }, { id: 'plan', label: 'Plan' }, { id: 'lastSeen', label: 'Last seen' }] as column (column.id)}
						<Table.Column id={column.id} rowHeader={column.rowHeader} textValue={column.label}>
							<Table.ColumnHeaderCell
								class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
								>{column.label}</Table.ColumnHeaderCell
							>
						</Table.Column>
					{/each}
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each workspaceMembers as member (member.id)}
					<Table.Row class="border-b border-gray-100 dark:border-gray-800">
						<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white"
							>{member.name}</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
							>{member.email}</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
							>{member.region}</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
							>{member.plan}</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
							>{member.lastSeen}</Table.Cell
						>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	{#snippet controls()}
		<div class="space-y-3">
			{#each ['email', 'region', 'plan', 'lastSeen'] as columnId (columnId)}
				<label
					class="flex items-center justify-between rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
				>
					<span>{columnId}</span>
					<input
						type="checkbox"
						checked={!directoryHiddenColumns.includes(columnId)}
						onchange={() => toggleDirectoryColumn(columnId)}
					/>
				</label>
			{/each}
			<DemoState label="hiddenColumns" value={directoryHiddenColumns} />
		</div>
	{/snippet}
</DemoSection>
