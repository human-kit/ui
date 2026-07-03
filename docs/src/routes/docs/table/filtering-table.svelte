<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/ui/table';
	import { filterableRequests } from './table-demo-data';

	let filterQuery = $state('');
	let filterTeam = $state('all');

	const filteredRequests = $derived.by(() => {
		const query = filterQuery.trim().toLowerCase();
		return filterableRequests.filter((request) => {
			const matchesTeam = filterTeam === 'all' || request.team === filterTeam;
			const matchesQuery =
				query.length === 0 ||
				request.requester.toLowerCase().includes(query) ||
				request.topic.toLowerCase().includes(query) ||
				request.status.toLowerCase().includes(query);
			return matchesTeam && matchesQuery;
		});
	});
</script>

<DemoSection
	title="Filtering"
	description="Filtering stays consumer-owned. This demo filters the dataset before rendering and uses `Table.EmptyState` when no rows match."
>
	<div
		class="w-full rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
	>
		<Table.Root
			aria-label="Filtered request queue"
			selectionMode="none"
			class="min-w-full border-collapse text-left"
		>
			<Table.Header>
				<Table.Row class="border-b border-gray-200 dark:border-gray-700">
					{#each [{ id: 'requester', label: 'Requester', rowHeader: true }, { id: 'topic', label: 'Topic' }, { id: 'team', label: 'Team' }, { id: 'status', label: 'Status' }] as column (column.id)}
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
				{#each filteredRequests as request (request.id)}
					<Table.Row class="border-b border-gray-100 dark:border-gray-800">
						<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white"
							>{request.requester}</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
							>{request.topic}</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
							>{request.team}</Table.Cell
						>
						<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
							>{request.status}</Table.Cell
						>
					</Table.Row>
				{/each}
				<Table.EmptyState>
					<div class="px-4 py-10 text-center">
						<p class="text-sm font-medium text-gray-900 dark:text-white">
							No requests match the current filters
						</p>
						<p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
							Try a different team or clear the search term.
						</p>
					</div>
				</Table.EmptyState>
			</Table.Body>
		</Table.Root>
	</div>

	{#snippet controls()}
		<div class="space-y-4">
			<label class="block space-y-2 text-sm text-gray-700 dark:text-gray-300">
				<span>Search</span>
				<input
					type="search"
					bind:value={filterQuery}
					placeholder="Search requester, topic, or status"
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
				/>
			</label>
			<label class="block space-y-2 text-sm text-gray-700 dark:text-gray-300">
				<span>Team</span>
				<select
					bind:value={filterTeam}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
				>
					<option value="all">All teams</option>
					<option value="Support">Support</option>
					<option value="Finance">Finance</option>
					<option value="Infra">Infra</option>
					<option value="Analytics">Analytics</option>
				</select>
			</label>
			<button
				type="button"
				class="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
				onclick={() => {
					filterQuery = '';
					filterTeam = 'all';
				}}
			>
				Clear filters
			</button>
			<DemoState label="query" value={filterQuery || 'none'} />
			<DemoState label="team" value={filterTeam} />
			<DemoState label="rows" value={filteredRequests.length} />
		</div>
	{/snippet}
</DemoSection>
