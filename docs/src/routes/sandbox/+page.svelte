<script lang="ts">
	import ReproTable from '$lib/repros/purchase-requests/index';
	import type { CellRenderContext } from '$lib/repros/purchase-requests/types';

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

	const purchaseRequests: PurchaseRequest[] = Array.from({ length: 100 }, (_, index) => {
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

<svelte:head>
	<title>Sandbox | Purchase Requests</title>
</svelte:head>

<div class="flex h-full min-h-[calc(100svh-8px)] min-w-0 flex-col gap-3">
	<header class="rounded-xl border border-border bg-depth-1 px-5 py-4 shadow-sm">
		<p class="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary">Sandbox Route</p>
		<h2 class="mt-2 text-2xl font-semibold text-foreground">Purchase Requests</h2>
		<p class="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
			This is the full isolated route copy of the consumer page. It runs under its own app shell
			instead of the docs showcase, so width jumps and first-paint overflow are easier to inspect.
		</p>
	</header>

	<ReproTable
		aria-label="Purchase requests"
		items={purchaseRequests}
		class="max-h-[calc(100vh-140px)] w-full"
		selectionMode="multiple"
		bind:selectedKeys={selectedPurchaseRequestIds}
	>
		<ReproTable.Column
			id="requestNumber"
			header="Request"
			isRowHeader
			resizable
			defaultWidth={350}
		/>
		<ReproTable.Column id="requester" header="Requester" resizable />
		<ReproTable.Column id="area" header="Area" resizable />
		<ReproTable.Column id="status" header="Status" resizable />
		<ReproTable.Column id="priority" header="Priority" resizable />
		<ReproTable.Column
			id="total"
			header="Total"
			align="right"
			sort={(item: PurchaseRequest) => item.total}
		>
			{#snippet cell(cellContext: CellRenderContext<PurchaseRequest>)}
				<div class="flex w-full justify-end">
					<span>${cellContext.item.total.toLocaleString()}</span>
				</div>
			{/snippet}
		</ReproTable.Column>
	</ReproTable>
</div>
