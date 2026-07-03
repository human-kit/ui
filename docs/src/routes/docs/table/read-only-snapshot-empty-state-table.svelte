<script lang="ts">
	import { DemoSection } from '$lib/demo';
	import { Table } from '@human-kit/ui/table';
	import { financeSnapshot } from './table-demo-data';
</script>

<DemoSection
	title="Read-Only Snapshot And Empty State"
	description="Two small tables side by side: one for a static KPI snapshot with a footer, and another for the empty state when there are no rows to render."
>
	<div class="grid w-full gap-4 xl:grid-cols-2">
		<div
			class="overflow-hidden rounded-2xl border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
		>
			<Table.Root
				aria-label="Finance snapshot"
				selectionMode="none"
				class="min-w-full border-collapse text-left"
			>
				<Table.Header>
					<Table.Row class="border-b border-gray-200 dark:border-gray-700">
						<Table.Column id="metric" rowHeader textValue="Metric"
							><Table.ColumnHeaderCell
								class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none dark:text-gray-300"
								>Metric</Table.ColumnHeaderCell
							></Table.Column
						>
						<Table.Column id="value" textValue="Value"
							><Table.ColumnHeaderCell
								class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none dark:text-gray-300"
								>Value</Table.ColumnHeaderCell
							></Table.Column
						>
						<Table.Column id="delta" textValue="Delta"
							><Table.ColumnHeaderCell
								class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none dark:text-gray-300"
								>Delta</Table.ColumnHeaderCell
							></Table.Column
						>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each financeSnapshot as item (item.id)}
						<Table.Row class="border-b border-gray-100 dark:border-gray-800">
							<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white"
								>{item.label}</Table.Cell
							>
							<Table.Cell class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200"
								>{item.value}</Table.Cell
							>
							<Table.Cell class="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400"
								>{item.delta}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
				<Table.Footer>
					<Table.Row>
						<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white"
							>Snapshot</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
							>Updated today</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
							>3 metrics</Table.Cell
						>
					</Table.Row>
				</Table.Footer>
			</Table.Root>
		</div>

		<div
			class="overflow-hidden rounded-2xl border border-dashed border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
		>
			<Table.Root
				aria-label="Empty approvals table"
				selectionMode="none"
				class="min-w-full border-collapse text-left"
			>
				<Table.Header>
					<Table.Row class="border-b border-gray-200 dark:border-gray-700">
						<Table.Column id="requester" rowHeader textValue="Requester"
							><Table.ColumnHeaderCell
								class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none dark:text-gray-300"
								>Requester</Table.ColumnHeaderCell
							></Table.Column
						>
						<Table.Column id="scope" textValue="Scope"
							><Table.ColumnHeaderCell
								class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none dark:text-gray-300"
								>Scope</Table.ColumnHeaderCell
							></Table.Column
						>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					<Table.EmptyState>
						<div class="px-4 py-10 text-center">
							<p class="text-sm font-medium text-gray-900 dark:text-white">No pending approvals</p>
							<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
								When new access requests arrive, they will show up here.
							</p>
						</div>
					</Table.EmptyState>
				</Table.Body>
			</Table.Root>
		</div>
	</div>
</DemoSection>
