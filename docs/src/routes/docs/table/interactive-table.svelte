<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/svelte-components/table';
	import type {
		TableSelectionBehavior,
		TableSelectionKey,
		TableSelectionMode,
		TableSortDescriptor
	} from '@human-kit/svelte-components/table';
	import {
		disabledUserIds,
		tableSelectionCheckboxClass,
		tableSelectionIndicatorClass,
		users
	} from './table-demo-data';

	let selectedKeys = $state<Set<TableSelectionKey>>(new Set(['danilo']));
	let selectionMode = $state<TableSelectionMode>('multiple');
	let selectionBehavior = $state<TableSelectionBehavior>('toggle');
	let sortDescriptor = $state<TableSortDescriptor | undefined>(undefined);
	let resizingColumnId = $state<string | null>(null);
	let hiddenColumns = $state<string[]>([]);
	let columnWidths = $state<Map<string, number> | undefined>(
		new Map([
			['email', 260],
			['group', 180]
		])
	);
	let sortableColumns = $state<string[]>(['group']);

	function toggleStringValue(values: string[], value: string) {
		return values.includes(value)
			? values.filter((currentValue) => currentValue !== value)
			: [...values, value];
	}

	function toggleSortableColumn(columnId: string) {
		sortableColumns = toggleStringValue(sortableColumns, columnId);
	}

	function toggleHiddenColumn(columnId: string) {
		hiddenColumns = hiddenColumns.includes(columnId)
			? hiddenColumns.filter((currentColumnId) => currentColumnId !== columnId)
			: [...hiddenColumns, columnId];
	}

	$effect(() => {
		if (sortDescriptor && !sortableColumns.includes(sortDescriptor.column)) {
			sortDescriptor = undefined;
		}
	});

	$effect(() => {
		if (sortDescriptor && hiddenColumns.includes(sortDescriptor.column)) {
			sortDescriptor = undefined;
		}
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

<DemoSection
	title="Interactive Table"
	description="Use arrow keys to move between cells, Space to select rows, drag the header handles or focus a handle and press Enter to enter keyboard resize mode, click enabled sortable headers to sort, and try replace mode with Shift+ArrowUp/Down. Long cell values truncate to preserve the column layout while resizing."
>
	<div
		class="overflow-x-auto rounded-xl border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
	>
		<Table.Root
			aria-label="Users table"
			{selectionMode}
			{selectionBehavior}
			disabledKeys={disabledUserIds}
			bind:selectedKeys
			bind:sortDescriptor
			bind:hiddenColumns
			bind:columnWidths
			onColumnResizeStart={(columnId) => {
				resizingColumnId = columnId;
			}}
			onColumnResizeEnd={() => {
				resizingColumnId = null;
			}}
			class="min-w-full border-collapse text-left"
		>
			<Table.Header>
				<Table.Row class="border-b border-gray-200 dark:border-gray-700">
					<Table.Column id="selection" textValue="Selection" width={64}>
						<Table.ColumnHeaderCell
							class="w-12 px-3 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white"
						>
							<Table.Checkbox class={tableSelectionCheckboxClass}>
								<Table.CheckboxIndicator class={tableSelectionIndicatorClass}>
									<svg aria-hidden="true" viewBox="0 0 16 16" class="h-3.5 w-3.5">
										<path
											d="M3.75 8.5 6.75 11.5 12.25 5.5"
											fill="none"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
										/>
									</svg>
								</Table.CheckboxIndicator>
							</Table.Checkbox>
						</Table.ColumnHeaderCell>
					</Table.Column>
					<Table.Column
						id="email"
						isRowHeader
						allowsSorting={sortableColumns.includes('email')}
						minWidth={30}
					>
						<Table.ColumnHeaderCell
							class="px-3 py-2 text-sm font-semibold text-gray-900 outline-none data-[sortable=true]:select-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-white"
							data-sortable={sortableColumns.includes('email') ? 'true' : undefined}
						>
							<div class="flex min-w-0 items-center justify-between gap-3">
								<span class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
									>Email</span
								>
								<Table.ColumnResizer
									class="inline-flex w-4 shrink-0 cursor-col-resize justify-center rounded-sm outline-none text-gray-400 hover:text-gray-600 data-[focus-visible=true]:bg-blue-50 data-[focus-visible=true]:text-blue-600 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[resizing=true]:bg-blue-600 data-[resizing=true]:text-white dark:text-gray-500 dark:hover:text-gray-300 dark:data-[focus-visible=true]:bg-blue-950/50 dark:data-[focus-visible=true]:text-blue-200 dark:data-[resizing=true]:bg-blue-500"
								>
									<span class="block h-5 w-0.5 rounded-full bg-current opacity-80"></span>
								</Table.ColumnResizer>
							</div>
						</Table.ColumnHeaderCell>
					</Table.Column>
					<Table.Column id="group" allowsSorting={sortableColumns.includes('group')} maxWidth={320}>
						<Table.ColumnHeaderCell
							class="px-3 py-2 text-sm font-semibold text-gray-900 outline-none data-[sortable=true]:select-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-white"
							data-sortable={sortableColumns.includes('group') ? 'true' : undefined}
						>
							<div class="flex min-w-0 items-center justify-between gap-3">
								<span class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
									>Group</span
								>
								<Table.ColumnResizer
									class="inline-flex w-4 shrink-0 cursor-col-resize justify-center rounded-sm outline-none text-gray-400 hover:text-gray-600 data-[focus-visible=true]:bg-blue-50 data-[focus-visible=true]:text-blue-600 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[resizing=true]:bg-blue-600 data-[resizing=true]:text-white dark:text-gray-500 dark:hover:text-gray-300 dark:data-[focus-visible=true]:bg-blue-950/50 dark:data-[focus-visible=true]:text-blue-200 dark:data-[resizing=true]:bg-blue-500"
								>
									<span class="block h-5 w-0.5 rounded-full bg-current opacity-80"></span>
								</Table.ColumnResizer>
							</div>
						</Table.ColumnHeaderCell>
					</Table.Column>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each sortedUsers as user (user.id)}
					<Table.Row
						id={user.id}
						class="border-b border-gray-100 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 data-selected:bg-blue-50 data-disabled:bg-gray-100/80 data-disabled:text-gray-400 data-disabled:opacity-70 dark:border-gray-800 dark:data-[focus-visible=true]:ring-blue-400 dark:data-selected:bg-blue-950/40 dark:data-disabled:bg-gray-800/70 dark:data-disabled:text-gray-500"
					>
						<Table.Cell class="w-12 px-3 py-2 text-center text-sm text-gray-500 dark:text-gray-300">
							<Table.Checkbox class={tableSelectionCheckboxClass}>
								<Table.CheckboxIndicator class={tableSelectionIndicatorClass}>
									<svg aria-hidden="true" viewBox="0 0 16 16" class="h-3.5 w-3.5">
										<path
											d="M3.75 8.5 6.75 11.5 12.25 5.5"
											fill="none"
											stroke="currentColor"
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
										/>
									</svg>
								</Table.CheckboxIndicator>
							</Table.Checkbox>
						</Table.Cell>
						<Table.Cell
							class="px-3 py-2 text-sm font-normal text-gray-900 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 data-disabled:line-through data-disabled:decoration-gray-400 dark:text-white dark:data-disabled:decoration-gray-600"
						>
							<div class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
								{user.email}
							</div>
						</Table.Cell>
						<Table.Cell
							class="px-3 py-2 text-sm font-normal text-gray-600 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 data-disabled:italic dark:text-gray-300"
						>
							<div class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
								{user.group}
							</div>
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
					<Table.Cell class="w-12 px-3 py-2" />
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
				<p class="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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
				<p class="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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
				<p class="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
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

			<div class="space-y-2">
				<p class="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
					Visible columns
				</p>
				<label
					class="flex items-center justify-between rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
				>
					<span>Email</span>
					<input
						type="checkbox"
						checked={!hiddenColumns.includes('email')}
						onchange={() => toggleHiddenColumn('email')}
					/>
				</label>
				<label
					class="flex items-center justify-between rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
				>
					<span>Group</span>
					<input
						type="checkbox"
						checked={!hiddenColumns.includes('group')}
						onchange={() => toggleHiddenColumn('group')}
					/>
				</label>
			</div>

			<div class="space-y-4">
				<DemoState label="hiddenColumns" value={hiddenColumns} />
				<DemoState label="selectedKeys" value={[...selectedKeys]} />
				<DemoState label="selectionMode" value={selectionMode} />
				<DemoState label="selectionBehavior" value={selectionBehavior} />
				<DemoState label="sortableColumns" value={sortableColumns} />
				<DemoState label="resizingColumn" value={resizingColumnId ?? 'none'} />
				<DemoState
					label="columnWidths"
					value={columnWidths ? Object.fromEntries(columnWidths) : 'auto'}
				/>
				<DemoState
					label="sortDescriptor"
					value={sortDescriptor ? `${sortDescriptor.column}:${sortDescriptor.direction}` : 'none'}
				/>
			</div>
		</div>
	{/snippet}
</DemoSection>
