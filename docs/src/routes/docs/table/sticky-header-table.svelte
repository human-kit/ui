<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/svelte-components/table';
	import { deploymentRuns } from './table-demo-data';
</script>

<DemoSection
	title="Sticky Header"
	description="A consumer-owned sticky header pattern: the scroll container owns overflow, and header cells opt into `position: sticky` with their own background and z-index."
>
	<div
		class="w-full rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
	>
		<div class="h-80 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-800">
			<Table.Root
				aria-label="Sticky deployment runs table"
				selectionMode="none"
				class="min-w-full border-separate border-spacing-0 text-left"
			>
				<Table.Header>
					<Table.Row>
						{#each [{ id: 'service', label: 'Service' }, { id: 'owner', label: 'Owner' }, { id: 'region', label: 'Region' }, { id: 'status', label: 'Status' }, { id: 'updatedAt', label: 'Updated' }] as column (column.id)}
							<Table.Column
								id={column.id}
								isRowHeader={column.id === 'service'}
								textValue={column.label}
								minWidth={60}
							>
								<Table.ColumnHeaderCell
									class="sticky top-0 z-10 border-b border-r border-gray-200 bg-white/95 pl-4 pr-0 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 backdrop-blur last:border-r-0 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300"
								>
									<div class="flex min-w-0 items-center justify-between gap-2">
										<span class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
											>{column.label}</span
										>
										<Table.ColumnResizer
											class="inline-flex w-4 shrink-0 cursor-col-resize justify-center rounded-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
										>
											<span class="block h-4 w-0.5 rounded-full bg-current opacity-60"></span>
										</Table.ColumnResizer>
									</div>
								</Table.ColumnHeaderCell>
							</Table.Column>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each deploymentRuns as run (run.id)}
						<Table.Row>
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-sm font-medium text-gray-900 last:border-r-0 dark:border-gray-800 dark:text-white"
								>{run.service}</Table.Cell
							>
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-sm text-gray-600 last:border-r-0 dark:border-gray-800 dark:text-gray-300"
								>{run.owner}</Table.Cell
							>
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-sm text-gray-500 last:border-r-0 dark:border-gray-800 dark:text-gray-400"
								>{run.region}</Table.Cell
							>
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-sm text-gray-600 last:border-r-0 dark:border-gray-800 dark:text-gray-300"
								><span
									class="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
									>{run.status}</span
								></Table.Cell
							>
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-sm text-gray-500 last:border-r-0 dark:border-gray-800 dark:text-gray-400"
								>{run.updatedAt}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>

	{#snippet controls()}
		<div class="space-y-4 text-sm text-gray-600 dark:text-gray-300">
			<p>
				The sticky behavior comes from the scroll shell plus sticky header cell classes. The Table
				API stays unchanged.
			</p>
			<DemoState label="rows" value={deploymentRuns.length} />
			<DemoState label="scrollContainer" value="h-80 + overflow-y-auto" />
			<DemoState label="tableLayout" value="border-separate border-spacing-0" />
		</div>
	{/snippet}
</DemoSection>
