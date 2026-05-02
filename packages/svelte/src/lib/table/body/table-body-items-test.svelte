<script lang="ts">
	import { Table } from '../index';

	type DemoRow = {
		id: string;
		email: string;
		group: string;
	};

	const rows: DemoRow[] = Array.from({ length: 120 }, (_, index) => {
		const sequence = index + 1;
		return {
			id: `row-${String(sequence).padStart(3, '0')}`,
			email: `user${sequence}@example.com`,
			group: sequence % 2 === 0 ? 'Admin' : 'Developer'
		};
	});
</script>

<div style="max-height: 240px; overflow: auto;">
	<Table.Root aria-label="Virtualized users table">
		<Table.Header>
			<Table.Row>
				<Table.Column id="email" isRowHeader textValue="Email">
					<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="group" textValue="Group">
					<Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
				</Table.Column>
			</Table.Row>
		</Table.Header>

		<Table.Body items={rows} virtualizer={{ rowHeight: 32, overscan: 4 }}>
			{#snippet children(row)}
				<Table.Row id={row.id} data-item-id={row.id}>
					<Table.Cell>{row.email}</Table.Cell>
					<Table.Cell>{row.group}</Table.Cell>
				</Table.Row>
			{/snippet}
			{#snippet empty()}
				<Table.EmptyState>No users found.</Table.EmptyState>
			{/snippet}
		</Table.Body>
	</Table.Root>
</div>
