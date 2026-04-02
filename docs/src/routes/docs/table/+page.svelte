<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/svelte-components';
	import type {
		TableSelectionBehavior,
		TableSelectionKey,
		TableSelectionMode,
		TableSortDescriptor
	} from '@human-kit/svelte-components';

	const users = [
		{ id: 'danilo', email: 'danilo@example.com', group: 'Developer' },
		{ id: 'zahra', email: 'zahra@example.com', group: 'Admin' },
		{ id: 'jasper', email: 'jasper@example.com', group: 'Developer' }
	];

	let selectedKeys = $state<Set<TableSelectionKey>>(new Set(['zahra']));
	let selectionMode = $state<TableSelectionMode>('multiple');
	let selectionBehavior = $state<TableSelectionBehavior>('toggle');
	let sortDescriptor = $state<TableSortDescriptor | undefined>(undefined);
	let sortableColumns = $state<string[]>(['group']);

	function toggleSortableColumn(columnId: string) {
		if (sortableColumns.includes(columnId)) {
			sortableColumns = sortableColumns.filter((value) => value !== columnId);
		} else {
			sortableColumns = [...sortableColumns, columnId];
		}
	}

	$effect(() => {
		if (sortDescriptor && !sortableColumns.includes(sortDescriptor.column)) {
			sortDescriptor = undefined;
		}
	});

	$effect(() => {
		if (selectionMode !== 'single' || selectedKeys.size <= 1) return;
		selectedKeys = new Set([selectedKeys.values().next().value as TableSelectionKey]);
	});

	const sortedUsers = $derived.by(() => {
		const rows = [...users];
		const descriptor = sortDescriptor;
		if (!descriptor) return rows;
		const direction = descriptor.direction === 'ascending' ? 1 : -1;
		return rows.sort(
			(a, b) =>
				String(a[descriptor.column as keyof (typeof users)[number]]).localeCompare(
					String(b[descriptor.column as keyof (typeof users)[number]])
				) * direction
		);
	});
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-6xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Table</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			Headless interactive table with grid navigation, row selection, and sortable headers.
		</p>

		<div class="space-y-8">
			<DemoSection
				title="Interactive Table"
				description="Use arrow keys to move between cells, Space to select rows, click enabled sortable headers to sort, and try replace mode with Shift+ArrowUp/Down."
			>
				<div
					class="overflow-x-auto rounded-xl border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
				>
					<Table.Root
						aria-label="Users table"
						{selectionMode}
						{selectionBehavior}
						bind:selectedKeys
						bind:sortDescriptor
						class="min-w-full border-collapse text-left"
					>
						<Table.Header>
							<Table.Row class="border-b border-gray-200 dark:border-gray-700">
								<Table.Column
									id="email"
									isRowHeader
									allowsSorting={sortableColumns.includes('email')}
								>
									<Table.ColumnHeaderCell
										class="px-3 py-2 text-sm font-semibold text-gray-900 outline-none data-[sortable=true]:cursor-pointer data-[sortable=true]:select-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 dark:text-white"
										data-sortable={sortableColumns.includes('email') ? 'true' : undefined}
									>
										Email
									</Table.ColumnHeaderCell>
								</Table.Column>
								<Table.Column id="group" allowsSorting={sortableColumns.includes('group')}>
									<Table.ColumnHeaderCell
										class="px-3 py-2 text-sm font-semibold text-gray-900 outline-none data-[sortable=true]:cursor-pointer data-[sortable=true]:select-none data-focus-visible:ring-2 data-focus-visible:ring-blue-500 dark:text-white"
										data-sortable={sortableColumns.includes('group') ? 'true' : undefined}
									>
										Group
									</Table.ColumnHeaderCell>
								</Table.Column>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each sortedUsers as user (user.id)}
								<Table.Row
									id={user.id}
									class="border-b border-gray-100 data-selected:bg-blue-50 dark:border-gray-800 dark:data-selected:bg-blue-950/40"
								>
									<Table.Cell
										class="px-3 py-2 text-sm font-normal text-gray-900 outline-none data-focus-visible:ring-2 data-focus-visible:ring-inset data-focus-visible:ring-blue-500 dark:text-white"
									>
										{user.email}
									</Table.Cell>
									<Table.Cell
										class="px-3 py-2 text-sm font-normal text-gray-600 outline-none data-focus-visible:ring-2 data-focus-visible:ring-inset data-focus-visible:ring-blue-500 dark:text-gray-300"
									>
										{user.group}
									</Table.Cell>
								</Table.Row>
							{/each}
							<Table.EmptyState>
								<span class="block px-3 py-4 text-sm text-gray-500 dark:text-gray-400"
									>No users found.</span
								>
							</Table.EmptyState>
						</Table.Body>
						<Table.Footer>
							<Table.Row>
								<Table.Cell class="px-3 py-2 text-sm font-medium text-gray-900 dark:text-white"
									>Total</Table.Cell
								>
								<Table.Cell class="px-3 py-2 text-sm text-gray-600 dark:text-gray-300"
									>{sortedUsers.length} users</Table.Cell
								>
							</Table.Row>
						</Table.Footer>
					</Table.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-5">
						<div class="space-y-2">
							<p
								class="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400"
							>
								Selection mode
							</p>
							<div class="grid grid-cols-3 gap-2">
								<button
									type="button"
									class="rounded-lg border px-3 py-2 text-sm transition data-[active=true]:border-blue-500 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 dark:border-gray-700 dark:text-gray-200 dark:data-[active=true]:bg-blue-950/40 dark:data-[active=true]:text-blue-200"
									data-active={selectionMode === 'none' ? 'true' : undefined}
									onclick={() => (selectionMode = 'none')}
								>
									None
								</button>
								<button
									type="button"
									class="rounded-lg border px-3 py-2 text-sm transition data-[active=true]:border-blue-500 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 dark:border-gray-700 dark:text-gray-200 dark:data-[active=true]:bg-blue-950/40 dark:data-[active=true]:text-blue-200"
									data-active={selectionMode === 'single' ? 'true' : undefined}
									onclick={() => (selectionMode = 'single')}
								>
									Single
								</button>
								<button
									type="button"
									class="rounded-lg border px-3 py-2 text-sm transition data-[active=true]:border-blue-500 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 dark:border-gray-700 dark:text-gray-200 dark:data-[active=true]:bg-blue-950/40 dark:data-[active=true]:text-blue-200"
									data-active={selectionMode === 'multiple' ? 'true' : undefined}
									onclick={() => (selectionMode = 'multiple')}
								>
									Multiple
								</button>
							</div>
						</div>

						<div class="space-y-2">
							<p
								class="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400"
							>
								Selection behavior
							</p>
							<div class="grid grid-cols-2 gap-2">
								<button
									type="button"
									class="rounded-lg border px-3 py-2 text-sm transition data-[active=true]:border-blue-500 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 dark:border-gray-700 dark:text-gray-200 dark:data-[active=true]:bg-blue-950/40 dark:data-[active=true]:text-blue-200"
									data-active={selectionBehavior === 'toggle' ? 'true' : undefined}
									onclick={() => (selectionBehavior = 'toggle')}
								>
									Toggle
								</button>
								<button
									type="button"
									class="rounded-lg border px-3 py-2 text-sm transition data-[active=true]:border-blue-500 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 dark:border-gray-700 dark:text-gray-200 dark:data-[active=true]:bg-blue-950/40 dark:data-[active=true]:text-blue-200"
									data-active={selectionBehavior === 'replace' ? 'true' : undefined}
									onclick={() => (selectionBehavior = 'replace')}
								>
									Replace
								</button>
							</div>
						</div>

						<div class="space-y-2">
							<p
								class="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400"
							>
								Sortable columns
							</p>
							<label
								class="flex items-center justify-between rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
							>
								<span>Email</span>
								<input
									type="checkbox"
									checked={sortableColumns.includes('email')}
									onchange={() => toggleSortableColumn('email')}
								/>
							</label>
							<label
								class="flex items-center justify-between rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
							>
								<span>Group</span>
								<input
									type="checkbox"
									checked={sortableColumns.includes('group')}
									onchange={() => toggleSortableColumn('group')}
								/>
							</label>
						</div>

						<div class="space-y-4">
							<DemoState label="selectedKeys" value={[...selectedKeys]} />
							<DemoState label="selectionMode" value={selectionMode} />
							<DemoState label="selectionBehavior" value={selectionBehavior} />
							<DemoState label="sortableColumns" value={sortableColumns} />
							<DemoState
								label="sortDescriptor"
								value={sortDescriptor
									? `${sortDescriptor.column}:${sortDescriptor.direction}`
									: 'none'}
							/>
						</div>
					</div>
				{/snippet}
			</DemoSection>

			<DemoSection title="Keyboard" description="Current v1 keyboard support">
				<div class="grid grid-cols-2 gap-4 text-sm text-gray-700 dark:text-gray-300">
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Tab</kbd><span
							>Enter and leave the grid</span
						>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">← ↑ ↓ →</kbd><span
							>Move between header and body cells</span
						>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Home / End</kbd
						><span>Move to row boundaries</span>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Ctrl+A</kbd><span
							>Select all rows in multiple mode</span
						>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Shift + ↑/↓</kbd
						><span>Extend row selection in `replace` mode</span>
					</div>
				</div>
			</DemoSection>
		</div>
	</div>
</div>
