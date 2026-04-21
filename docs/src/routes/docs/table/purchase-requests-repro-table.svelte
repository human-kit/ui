<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import ReproTable from '$lib/repros/purchase-requests/table.svelte';

	type PurchaseRequest = {
		id: string;
		requestNumber: string;
		requester: string;
		area: string;
		status: 'Pending' | 'Review' | 'Approved' | 'Rejected';
		priority: 'Low' | 'Medium' | 'High';
		total: number;
	};

	const requesters = [
		'Ana Gomez',
		'Lucas Perez',
		'Mara Silva',
		'Juan Torres',
		'Sofia Rivas',
		'Martin Lopez',
		'Camila Diaz',
		'Tomas Herrera'
	] as const;

	const areas = [
		'Production',
		'Logistics',
		'Maintenance',
		'Quality',
		'Procurement',
		'Operations'
	] as const;

	const statuses: PurchaseRequest['status'][] = ['Pending', 'Review', 'Approved', 'Rejected'];
	const priorities: PurchaseRequest['priority'][] = ['Low', 'Medium', 'High'];

	const purchaseRequests: PurchaseRequest[] = Array.from({ length: 10 }, (_, index) => {
		const sequence = index + 1;
		const status = statuses[index % statuses.length];
		const priority = priorities[index % priorities.length];

		return {
			id: `pr-${String(sequence).padStart(3, '0')}`,
			requestNumber: `PR-${String(sequence).padStart(4, '0')}`,
			requester: requesters[index % requesters.length],
			area: areas[index % areas.length],
			status,
			priority,
			total: 850 + sequence * 137 + (index % 5) * 95
		};
	});

	let selectedPurchaseRequestIds = $state<Array<string | number>>([
		purchaseRequests[0].id,
		purchaseRequests[3].id,
		purchaseRequests[7].id
	]);
</script>

<DemoSection
	title="Purchase Requests Repro"
	description="Near-literal copy of the celagem-svelte purchase requests table and wrapper so first-paint column sizing can be reproduced inside this docs app."
>
	<ReproTable
		aria-label="Purchase requests"
		items={purchaseRequests}
		class="max-h-[calc(100vh-34px)] w-full"
		selectionMode="multiple"
		bind:selectedKeys={selectedPurchaseRequestIds}
	>
		{#snippet columns({ Column })}
			<Column
				id="requestNumber"
				header="Request"
				isRowHeader
				allowsSorting
				resizable
				defaultWidth={350}
			/>
			<Column id="requester" header="Requester" allowsSorting resizable />
			<Column id="area" header="Area" allowsSorting resizable />
			<Column id="status" header="Status" allowsSorting resizable />
			<Column id="priority" header="Priority" allowsSorting resizable />
			<Column id="total" header="Total" align="right" allowsSorting sort={(item) => item.total}>
				{#snippet cell(cellContext)}
					<div class="flex w-full justify-end">
						<span>${cellContext.item.total.toLocaleString()}</span>
					</div>
				{/snippet}
			</Column>
		{/snippet}
	</ReproTable>

	{#snippet controls()}
		<div class="space-y-4 text-sm text-gray-600 dark:text-gray-300">
			<p>
				This uses the same selection column injection, one explicit `defaultWidth`, and the rest as
				implicit resizable columns, matching the consumer app setup.
			</p>
			<DemoState label="rows" value={purchaseRequests.length} />
			<DemoState label="selectionMode" value="multiple" />
			<DemoState label="explicitWidths" value="requestNumber=350, selection=44" />
			<DemoState label="implicitResizableColumns" value="5" />
		</div>
	{/snippet}
</DemoSection>
