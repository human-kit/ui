<script lang="ts">
	import { DemoSection } from '$lib/demo';
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

	const purchaseRequests: PurchaseRequest[] = [
		{
			id: 'pr-001',
			requestNumber: 'PR-001',
			requester: 'Ana Gomez',
			area: 'Production',
			status: 'Pending',
			priority: 'Medium',
			total: 1520
		},
		{
			id: 'pr-002',
			requestNumber: 'PR-002',
			requester: 'Lucas Perez',
			area: 'Logistics',
			status: 'Approved',
			priority: 'Low',
			total: 870
		},
		{
			id: 'pr-003',
			requestNumber: 'PR-003',
			requester: 'Mara Silva',
			area: 'Maintenance',
			status: 'Review',
			priority: 'High',
			total: 2300
		}
	];

	function getTotalSortValue(item: PurchaseRequest) {
		return item.total;
	}
</script>

<DemoSection
	title="Items + Columns"
	description="Replica of the narrow components demo so first-paint sizing and drag behavior can be checked locally."
>
	<ReproTable aria-label="Items + Columns" items={purchaseRequests} class="w-75">
		<ReproTable.Column
			id="requestNumber"
			header="Request"
			isRowHeader
			allowsSorting
			resizable
			minWidth={75}
		/>
		<ReproTable.Column id="requester" header="Requester" allowsSorting resizable minWidth={140} />
		<ReproTable.Column id="area" header="Area" resizable />
		<ReproTable.Column id="status" header="Status" resizable />
		<ReproTable.Column
			id="total"
			header="Total"
			align="right"
			allowsSorting
			resizable
			sort={getTotalSortValue}
		>
			{#snippet cell(cellContext: CellRenderContext<PurchaseRequest>)}
				<div class="flex w-full justify-end">
					<span>${cellContext.item.total.toLocaleString()}</span>
				</div>
			{/snippet}
		</ReproTable.Column>
	</ReproTable>
</DemoSection>
