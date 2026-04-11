<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/svelte-components/table';
	import type {
		TableSelectionBehavior,
		TableSelectionKey,
		TableSelectionMode,
		TableSortDescriptor
	} from '@human-kit/svelte-components/table';

	const users = [
		{ id: 'danilo', email: 'danilo.fernandez+workspace-owner@example.com', group: 'Developer' },
		{ id: 'zahra', email: 'zahra@example.com', group: 'Admin' },
		{
			id: 'jasper',
			email: 'jasper.with-a-very-long-email-address@example.com',
			group: 'Developer'
		},
		{ id: 'marta', email: 'marta@example.com', group: 'Support' },
		{ id: 'nora', email: 'nora@example.com', group: 'Finance' },
		{ id: 'liam', email: 'liam@example.com', group: 'Ops' }
	];
	const inboxThreads = [
		{
			id: 'deploy',
			sender: 'Infra Team',
			subject: 'Production deploy window confirmed',
			status: 'Ready',
			updatedAt: '2m ago'
		},
		{
			id: 'billing',
			sender: 'Finance',
			subject: 'Invoice discrepancy on enterprise renewal',
			status: 'Needs review',
			updatedAt: '18m ago'
		},
		{
			id: 'access',
			sender: 'Support',
			subject: 'Access request for new workspace maintainers',
			status: 'Queued',
			updatedAt: '41m ago'
		}
	];
	const financeSnapshot = [
		{ id: 'mrr', label: 'Monthly recurring revenue', value: '$182,400', delta: '+6.8%' },
		{ id: 'churn', label: 'Logo churn', value: '1.2%', delta: '-0.4 pts' },
		{ id: 'nps', label: 'Expansion pipeline', value: '$48,900', delta: '+12.1%' }
	];
	const deploymentRuns = [
		{
			id: 'dep-481',
			service: 'Checkout API',
			owner: 'Infra',
			region: 'us-east-1',
			status: 'Healthy',
			updatedAt: '09:12'
		},
		{
			id: 'dep-482',
			service: 'Identity Worker',
			owner: 'Platform',
			region: 'sa-east-1',
			status: 'Rolling',
			updatedAt: '09:18'
		},
		{
			id: 'dep-483',
			service: 'Billing Queue',
			owner: 'Finance',
			region: 'us-west-2',
			status: 'Healthy',
			updatedAt: '09:24'
		},
		{
			id: 'dep-484',
			service: 'Session Cache',
			owner: 'Platform',
			region: 'eu-west-1',
			status: 'Degraded',
			updatedAt: '09:31'
		},
		{
			id: 'dep-485',
			service: 'Tenant Exporter',
			owner: 'Support',
			region: 'us-east-1',
			status: 'Healthy',
			updatedAt: '09:35'
		},
		{
			id: 'dep-486',
			service: 'Audit Trail',
			owner: 'Security',
			region: 'eu-central-1',
			status: 'Rolling',
			updatedAt: '09:42'
		},
		{
			id: 'dep-487',
			service: 'Usage Aggregator',
			owner: 'Analytics',
			region: 'us-west-2',
			status: 'Healthy',
			updatedAt: '09:49'
		},
		{
			id: 'dep-488',
			service: 'Support Inbox',
			owner: 'Support',
			region: 'sa-east-1',
			status: 'Healthy',
			updatedAt: '09:56'
		},
		{
			id: 'dep-489',
			service: 'Webhook Relay',
			owner: 'Integrations',
			region: 'us-east-1',
			status: 'Queued',
			updatedAt: '10:03'
		},
		{
			id: 'dep-490',
			service: 'Tenant Provisioner',
			owner: 'Ops',
			region: 'eu-west-1',
			status: 'Healthy',
			updatedAt: '10:11'
		}
	];
	const workspaceMembers = [
		{
			id: 'member-danilo',
			name: 'Danilo Fernandez',
			email: 'danilo.fernandez+workspace-owner@example.com',
			region: 'Buenos Aires',
			plan: 'Enterprise',
			lastSeen: '2m ago'
		},
		{
			id: 'member-zahra',
			name: 'Zahra Khan',
			email: 'zahra@example.com',
			region: 'Dubai',
			plan: 'Business',
			lastSeen: '9m ago'
		},
		{
			id: 'member-jasper',
			name: 'Jasper Cole',
			email: 'jasper.with-a-very-long-email-address@example.com',
			region: 'Toronto',
			plan: 'Enterprise',
			lastSeen: '18m ago'
		},
		{
			id: 'member-marta',
			name: 'Marta Alvarez',
			email: 'marta@example.com',
			region: 'Madrid',
			plan: 'Business',
			lastSeen: '26m ago'
		},
		{
			id: 'member-nora',
			name: 'Nora Patel',
			email: 'nora@example.com',
			region: 'London',
			plan: 'Starter',
			lastSeen: '41m ago'
		},
		{
			id: 'member-liam',
			name: 'Liam Owens',
			email: 'liam@example.com',
			region: 'Dublin',
			plan: 'Enterprise',
			lastSeen: '1h ago'
		}
	];
	const filterableRequests = [
		{
			id: 'req-201',
			requester: 'Northwind Labs',
			topic: 'SSO certificate rollover',
			team: 'Support',
			priority: 'Urgent',
			status: 'Open'
		},
		{
			id: 'req-202',
			requester: 'Comet Health',
			topic: 'Invoice mismatch on annual renewal',
			team: 'Finance',
			priority: 'Medium',
			status: 'Queued'
		},
		{
			id: 'req-203',
			requester: 'Atlas Works',
			topic: 'Webhook retry storm after maintenance',
			team: 'Infra',
			priority: 'High',
			status: 'Investigating'
		},
		{
			id: 'req-204',
			requester: 'Delta Freight',
			topic: 'Team invite emails delayed',
			team: 'Support',
			priority: 'Low',
			status: 'Open'
		},
		{
			id: 'req-205',
			requester: 'Hearth Cloud',
			topic: 'Missing usage export for March',
			team: 'Analytics',
			priority: 'Medium',
			status: 'Queued'
		},
		{
			id: 'req-206',
			requester: 'River Retail',
			topic: 'Card updater job paused in staging',
			team: 'Finance',
			priority: 'High',
			status: 'Resolved'
		}
	];
	const invoiceRows = Array.from({ length: 18 }, (_, index) => ({
		id: `inv-${1000 + index}`,
		customer: ['Northwind', 'Comet', 'Atlas', 'Delta', 'Hearth', 'River'][index % 6],
		issuedAt: `2026-04-${String((index % 9) + 1).padStart(2, '0')}`,
		total: `$${(index + 4) * 320}`,
		status: ['Paid', 'Pending', 'Review'][index % 3]
	}));
	const disabledUserIds = ['zahra', 'nora'];
	const tableSelectionCheckboxClass =
		'group inline-flex h-6 w-6 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm outline-none transition-all hover:border-blue-400 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 data-[checked=true]:border-blue-600 data-[checked=true]:bg-blue-600 data-[checked=true]:text-white data-[indeterminate=true]:border-amber-500 data-[indeterminate=true]:bg-amber-500 data-[indeterminate=true]:text-white data-[disabled=true]:cursor-not-allowed data-[disabled=true]:border-gray-200 data-[disabled=true]:bg-gray-100 data-[disabled=true]:text-gray-300 data-[disabled=true]:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:border-blue-400 dark:data-[disabled=true]:border-gray-700 dark:data-[disabled=true]:bg-gray-800 dark:data-[disabled=true]:text-gray-600';
	const tableSelectionIndicatorClass = 'inline-flex h-3.5 w-3.5 items-center justify-center';

	let selectedKeys = $state<Set<TableSelectionKey>>(new Set(['danilo']));
	let inboxSelectedKeys = $state<Set<TableSelectionKey>>(new Set(['billing']));
	let selectionMode = $state<TableSelectionMode>('multiple');
	let selectionBehavior = $state<TableSelectionBehavior>('toggle');
	let sortDescriptor = $state<TableSortDescriptor | undefined>(undefined);
	let resizingColumnId = $state<string | null>(null);
	let hiddenColumns = $state<string[]>([]);
	let directoryHiddenColumns = $state<string[]>(['lastSeen']);
	let filterQuery = $state('');
	let filterTeam = $state('all');
	let invoicePage = $state(1);
	let invoicePageSize = $state(5);
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

	function toggleDirectoryColumn(columnId: string) {
		directoryHiddenColumns = toggleStringValue(directoryHiddenColumns, columnId);
	}

	function goToInvoicePage(nextPage: number) {
		invoicePage = Math.max(1, Math.min(invoicePageCount, nextPage));
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

	const invoicePageCount = $derived(Math.max(1, Math.ceil(invoiceRows.length / invoicePageSize)));
	const paginatedInvoices = $derived.by(() => {
		const startIndex = (invoicePage - 1) * invoicePageSize;
		return invoiceRows.slice(startIndex, startIndex + invoicePageSize);
	});
	const invoiceRangeStart = $derived(
		invoiceRows.length === 0 ? 0 : (invoicePage - 1) * invoicePageSize + 1
	);
	const invoiceRangeEnd = $derived(Math.min(invoicePage * invoicePageSize, invoiceRows.length));

	$effect(() => {
		if (invoicePage > invoicePageCount) {
			invoicePage = invoicePageCount;
		}
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
								<Table.Column
									id="group"
									allowsSorting={sortableColumns.includes('group')}
									maxWidth={320}
								>
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
									<Table.Cell
										class="w-12 px-3 py-2 text-center text-sm text-gray-500 dark:text-gray-300"
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

						<div class="space-y-2">
							<p
								class="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400"
							>
								Visible columns
							</p>
							<label
								class="flex items-center justify-between rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
							>
								<span>Email</span>
								<input
									type="checkbox"
									checked={!hiddenColumns.includes('email')}
									onchange={() =>
										(hiddenColumns = hiddenColumns.includes('email')
											? hiddenColumns.filter((columnId) => columnId !== 'email')
											: [...hiddenColumns, 'email'])}
								/>
							</label>
							<label
								class="flex items-center justify-between rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
							>
								<span>Group</span>
								<input
									type="checkbox"
									checked={!hiddenColumns.includes('group')}
									onchange={() =>
										(hiddenColumns = hiddenColumns.includes('group')
											? hiddenColumns.filter((columnId) => columnId !== 'group')
											: [...hiddenColumns, 'group'])}
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
								value={sortDescriptor
									? `${sortDescriptor.column}:${sortDescriptor.direction}`
									: 'none'}
							/>
						</div>
					</div>
				{/snippet}
			</DemoSection>

			<DemoSection
				title="Single Selection Inbox"
				description="A denser inbox-style table where the row selection UI stays explicit, but the header checkbox disappears automatically because the table is in single-selection mode."
			>
				<div
					class="w-full overflow-x-auto rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
				>
					<Table.Root
						aria-label="Inbox triage table"
						selectionMode="single"
						selectionBehavior="replace"
						bind:selectedKeys={inboxSelectedKeys}
						class="min-w-full border-collapse text-left"
					>
						<Table.Header>
							<Table.Row class="border-b border-gray-200 dark:border-gray-700">
								<Table.Column
									id="selection"
									textValue="Selection"
									width={64}
									minWidth={64}
									maxWidth={64}
								>
									<Table.ColumnHeaderCell
										class="w-12 px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500"
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
								<Table.Column id="subject" isRowHeader textValue="Subject">
									<Table.ColumnHeaderCell
										class="px-3 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-300"
									>
										Subject
									</Table.ColumnHeaderCell>
								</Table.Column>
								<Table.Column id="status" textValue="Status">
									<Table.ColumnHeaderCell
										class="px-3 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-300"
									>
										Status
									</Table.ColumnHeaderCell>
								</Table.Column>
								<Table.Column id="updated" textValue="Updated">
									<Table.ColumnHeaderCell
										class="px-3 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-300"
									>
										Updated
									</Table.ColumnHeaderCell>
								</Table.Column>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each inboxThreads as thread (thread.id)}
								<Table.Row
									id={thread.id}
									class="border-b border-gray-100 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 data-selected:bg-blue-50/70 dark:border-gray-800 dark:data-[focus-visible=true]:ring-blue-400 dark:data-selected:bg-blue-950/30"
								>
									<Table.Cell class="w-12 px-3 py-3 text-center">
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
										class="px-3 py-3 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500"
									>
										<div class="flex min-w-0 flex-col gap-1">
											<div
												class="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500"
											>
												<span>{thread.sender}</span>
											</div>
											<div
												class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
											>
												{thread.subject}
											</div>
										</div>
									</Table.Cell>
									<Table.Cell
										class="px-3 py-3 text-sm text-gray-600 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-300"
									>
										<span
											class="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
										>
											{thread.status}
										</span>
									</Table.Cell>
									<Table.Cell
										class="px-3 py-3 text-sm text-gray-500 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-400"
									>
										{thread.updatedAt}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<p class="text-sm text-gray-600 dark:text-gray-300">
							The first column keeps explicit row checkboxes, but the header checkbox is hidden
							because `selectionMode` is fixed to `single`.
						</p>
						<DemoState label="selectedKeys" value={[...inboxSelectedKeys]} />
					</div>
				{/snippet}
			</DemoSection>

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
									<Table.Column id="metric" isRowHeader textValue="Metric">
										<Table.ColumnHeaderCell
											class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none dark:text-gray-300"
										>
											Metric
										</Table.ColumnHeaderCell>
									</Table.Column>
									<Table.Column id="value" textValue="Value">
										<Table.ColumnHeaderCell
											class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none dark:text-gray-300"
										>
											Value
										</Table.ColumnHeaderCell>
									</Table.Column>
									<Table.Column id="delta" textValue="Delta">
										<Table.ColumnHeaderCell
											class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none dark:text-gray-300"
										>
											Delta
										</Table.ColumnHeaderCell>
									</Table.Column>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each financeSnapshot as item (item.id)}
									<Table.Row class="border-b border-gray-100 dark:border-gray-800">
										<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
											{item.label}
										</Table.Cell>
										<Table.Cell class="px-4 py-3 text-sm text-gray-700 dark:text-gray-200">
											{item.value}
										</Table.Cell>
										<Table.Cell class="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400">
											{item.delta}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
							<Table.Footer>
								<Table.Row>
									<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
										Snapshot
									</Table.Cell>
									<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
										Updated today
									</Table.Cell>
									<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
										3 metrics
									</Table.Cell>
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
									<Table.Column id="requester" isRowHeader textValue="Requester">
										<Table.ColumnHeaderCell
											class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none dark:text-gray-300"
										>
											Requester
										</Table.ColumnHeaderCell>
									</Table.Column>
									<Table.Column id="scope" textValue="Scope">
										<Table.ColumnHeaderCell
											class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none dark:text-gray-300"
										>
											Scope
										</Table.ColumnHeaderCell>
									</Table.Column>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								<Table.EmptyState>
									<div class="px-4 py-10 text-center">
										<p class="text-sm font-medium text-gray-900 dark:text-white">
											No pending approvals
										</p>
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

			<DemoSection
				title="Sticky Header"
				description="A consumer-owned sticky header pattern: the scroll container owns overflow, and header cells opt into `position: sticky` with their own background and z-index."
			>
				<div
					class="w-full rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
				>
					<div
						class="max-h-96 overflow-auto rounded-xl border border-gray-200 dark:border-gray-800"
					>
						<Table.Root
							aria-label="Sticky deployment runs table"
							selectionMode="none"
							class="min-w-full border-collapse text-left"
						>
							<Table.Header>
								<Table.Row>
									<Table.Column id="service" isRowHeader textValue="Service">
										<Table.ColumnHeaderCell
											class="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300"
										>
											Service
										</Table.ColumnHeaderCell>
									</Table.Column>
									<Table.Column id="owner" textValue="Owner">
										<Table.ColumnHeaderCell
											class="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300"
										>
											Owner
										</Table.ColumnHeaderCell>
									</Table.Column>
									<Table.Column id="region" textValue="Region">
										<Table.ColumnHeaderCell
											class="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300"
										>
											Region
										</Table.ColumnHeaderCell>
									</Table.Column>
									<Table.Column id="status" textValue="Status">
										<Table.ColumnHeaderCell
											class="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300"
										>
											Status
										</Table.ColumnHeaderCell>
									</Table.Column>
									<Table.Column id="updatedAt" textValue="Updated at">
										<Table.ColumnHeaderCell
											class="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300"
										>
											Updated
										</Table.ColumnHeaderCell>
									</Table.Column>
								</Table.Row>
							</Table.Header>
							<Table.Body>
								{#each deploymentRuns as run (run.id)}
									<Table.Row class="border-b border-gray-100 dark:border-gray-800">
										<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
											{run.service}
										</Table.Cell>
										<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
											{run.owner}
										</Table.Cell>
										<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
											{run.region}
										</Table.Cell>
										<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
											<span
												class="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
											>
												{run.status}
											</span>
										</Table.Cell>
										<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
											{run.updatedAt}
										</Table.Cell>
									</Table.Row>
								{/each}
							</Table.Body>
						</Table.Root>
					</div>
				</div>

				{#snippet controls()}
					<div class="space-y-4 text-sm text-gray-600 dark:text-gray-300">
						<p>
							The sticky behavior comes from the scroll shell plus sticky header cell classes. The
							Table API stays unchanged.
						</p>
						<DemoState label="rows" value={deploymentRuns.length} />
						<DemoState label="scrollContainer" value="max-h-[24rem] + overflow-auto" />
					</div>
				{/snippet}
			</DemoSection>

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
								<Table.Column id="name" isRowHeader textValue="Name">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
									>
										Name
									</Table.ColumnHeaderCell>
								</Table.Column>
								<Table.Column id="email" textValue="Email">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
									>
										Email
									</Table.ColumnHeaderCell>
								</Table.Column>
								<Table.Column id="region" textValue="Region">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
									>
										Region
									</Table.ColumnHeaderCell>
								</Table.Column>
								<Table.Column id="plan" textValue="Plan">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
									>
										Plan
									</Table.ColumnHeaderCell>
								</Table.Column>
								<Table.Column id="lastSeen" textValue="Last seen">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
									>
										Last seen
									</Table.ColumnHeaderCell>
								</Table.Column>
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
								<Table.Column id="requester" isRowHeader textValue="Requester">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
										>Requester</Table.ColumnHeaderCell
									>
								</Table.Column>
								<Table.Column id="topic" textValue="Topic">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
										>Topic</Table.ColumnHeaderCell
									>
								</Table.Column>
								<Table.Column id="team" textValue="Team">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
										>Team</Table.ColumnHeaderCell
									>
								</Table.Column>
								<Table.Column id="status" textValue="Status">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
										>Status</Table.ColumnHeaderCell
									>
								</Table.Column>
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

			<DemoSection
				title="Pagination"
				description="Pagination also stays consumer-owned: slice the dataset before rendering, then drive the current page from external controls or app state."
			>
				<div
					class="w-full space-y-4 rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
				>
					<Table.Root
						aria-label="Paginated invoices table"
						selectionMode="none"
						class="min-w-full border-collapse text-left"
					>
						<Table.Header>
							<Table.Row class="border-b border-gray-200 dark:border-gray-700">
								<Table.Column id="customer" isRowHeader textValue="Customer">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
										>Customer</Table.ColumnHeaderCell
									>
								</Table.Column>
								<Table.Column id="issuedAt" textValue="Issued at">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
										>Issued</Table.ColumnHeaderCell
									>
								</Table.Column>
								<Table.Column id="total" textValue="Total">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
										>Total</Table.ColumnHeaderCell
									>
								</Table.Column>
								<Table.Column id="status" textValue="Status">
									<Table.ColumnHeaderCell
										class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-300"
										>Status</Table.ColumnHeaderCell
									>
								</Table.Column>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each paginatedInvoices as invoice (invoice.id)}
								<Table.Row class="border-b border-gray-100 dark:border-gray-800">
									<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white"
										>{invoice.customer}</Table.Cell
									>
									<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
										>{invoice.issuedAt}</Table.Cell
									>
									<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
										>{invoice.total}</Table.Cell
									>
									<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300"
										>{invoice.status}</Table.Cell
									>
								</Table.Row>
							{/each}
						</Table.Body>
						<Table.Footer>
							<Table.Row>
								<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white"
									>Showing</Table.Cell
								>
								<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
									>{invoiceRangeStart}-{invoiceRangeEnd}</Table.Cell
								>
								<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
									>of {invoiceRows.length}</Table.Cell
								>
								<Table.Cell class="px-4 py-3 text-sm text-gray-500 dark:text-gray-400"
									>Page {invoicePage}/{invoicePageCount}</Table.Cell
								>
							</Table.Row>
						</Table.Footer>
					</Table.Root>

					<div
						class="flex flex-col gap-3 border-t border-gray-200 pt-3 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between"
					>
						<p class="text-sm text-gray-500 dark:text-gray-400">
							Rows {invoiceRangeStart}-{invoiceRangeEnd} of {invoiceRows.length}
						</p>
						<div class="flex items-center gap-2">
							<button
								type="button"
								class="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
								disabled={invoicePage === 1}
								onclick={() => goToInvoicePage(invoicePage - 1)}
							>
								Previous
							</button>
							<div
								class="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
							>
								Page {invoicePage}
							</div>
							<button
								type="button"
								class="rounded-lg border px-3 py-2 text-sm disabled:opacity-40 dark:border-gray-700 dark:text-gray-200"
								disabled={invoicePage === invoicePageCount}
								onclick={() => goToInvoicePage(invoicePage + 1)}
							>
								Next
							</button>
						</div>
					</div>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<label class="block space-y-2 text-sm text-gray-700 dark:text-gray-300">
							<span>Page size</span>
							<select
								bind:value={invoicePageSize}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
							>
								<option value={5}>5 rows</option>
								<option value={6}>6 rows</option>
								<option value={9}>9 rows</option>
							</select>
						</label>
						<DemoState label="page" value={invoicePage} />
						<DemoState label="pageSize" value={invoicePageSize} />
						<DemoState label="pageCount" value={invoicePageCount} />
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
							>Move between header cells, body cells, and focused body rows at row edges</span
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
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Enter</kbd><span
							>Enter or leave keyboard resize mode on the focused handle</span
						>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">← / →</kbd><span
							>Resize the focused column handle while resize mode is active</span
						>
					</div>
					<div class="flex items-center gap-2">
						<kbd class="rounded bg-gray-200 px-2 py-1 text-xs dark:bg-gray-700">Home / End</kbd
						><span
							>Set the focused column handle to minimum width or auto-fit while resize mode is
							active</span
						>
					</div>
				</div>
			</DemoSection>

			<DemoSection
				title="Behavior Notes"
				description="Current v1 interaction constraints that are intentional."
			>
				<div class="grid gap-3 text-sm text-gray-700 dark:text-gray-300">
					<p>`selectionMode="none"` clears any existing row selection internally.</p>
					<p>
						`defaultSelectedKeys` and `defaultSortDescriptor` set uncontrolled initial state only.
					</p>
					<p>
						`columnWidths` can be controlled with `bind:columnWidths`; resize handles update the
						owning column only.
					</p>
					<p>
						Text selection and `Ctrl+C` remain browser-native; `Table` does not implement custom
						copy behavior in v1.
					</p>
					<p>
						In `replace` mode, leaving the table clears focus state but keeps the current selection.
					</p>
					<p>Disabled rows stay visible but are skipped by keyboard focus and navigation.</p>
				</div>
			</DemoSection>
		</div>
	</div>
</div>
