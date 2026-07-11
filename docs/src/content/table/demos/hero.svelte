<script lang="ts">
	import { Table } from '@human-kit/svelte-components';

	const deployments = [
		{ id: 'dep-1', service: 'Checkout API', owner: 'Infra', status: 'Healthy' },
		{ id: 'dep-2', service: 'Identity Worker', owner: 'Platform', status: 'Rolling' },
		{ id: 'dep-3', service: 'Billing Queue', owner: 'Finance', status: 'Healthy' },
		{ id: 'dep-4', service: 'Session Cache', owner: 'Platform', status: 'Degraded' },
		{ id: 'dep-5', service: 'Audit Trail', owner: 'Security', status: 'Rolling' }
	];

	const columns = [
		{ id: 'service', label: 'Service', rowHeader: true },
		{ id: 'owner', label: 'Owner' },
		{ id: 'status', label: 'Status' }
	];

	const cellClass =
		'px-4 py-3 text-sm text-neutral-600 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-neutral-300';
</script>

<div
	class="w-full overflow-x-auto rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-900"
>
	<Table.Root aria-label="Deployments table" class="min-w-full border-collapse text-left">
		<Table.Header>
			<Table.Row class="border-b border-neutral-200 dark:border-neutral-700">
				{#each columns as column (column.id)}
					<Table.Column id={column.id} rowHeader={column.rowHeader} textValue={column.label}>
						<Table.ColumnHeaderCell
							class="px-4 py-3 text-xs font-semibold tracking-widest text-neutral-500 uppercase outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-neutral-300"
						>
							{column.label}
						</Table.ColumnHeaderCell>
					</Table.Column>
				{/each}
			</Table.Row>
		</Table.Header>
		<Table.Body>
			{#each deployments as deployment (deployment.id)}
				<Table.Row id={deployment.id} class="border-b border-neutral-100 dark:border-neutral-800">
					<Table.Cell
						class="px-4 py-3 text-sm font-medium text-neutral-900 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-white"
					>
						{deployment.service}
					</Table.Cell>
					<Table.Cell class={cellClass}>{deployment.owner}</Table.Cell>
					<Table.Cell class={cellClass}>{deployment.status}</Table.Cell>
				</Table.Row>
			{/each}
			<Table.EmptyState>
				<span class="block px-4 py-4 text-sm text-neutral-500 dark:text-neutral-400">
					No deployments found.
				</span>
			</Table.EmptyState>
		</Table.Body>
		<Table.Footer>
			<Table.Row>
				<Table.Cell class="px-4 py-3 text-sm font-medium text-neutral-900 dark:text-white">
					Total
				</Table.Cell>
				<Table.Cell class={cellClass}>{deployments.length} services</Table.Cell>
				<Table.Cell class={cellClass} />
			</Table.Row>
		</Table.Footer>
	</Table.Root>
</div>
