<script lang="ts">
	import { Table } from '../index';

	let { recycle = true }: { recycle?: boolean } = $props();

	type DemoRow = { id: string; label: string };

	const rows: DemoRow[] = Array.from({ length: 200 }, (_, index) => ({
		id: `row-${String(index + 1).padStart(3, '0')}`,
		label: `Label ${index + 1}`
	}));
</script>

<div style="max-height: 240px; overflow: auto;">
	<Table.Root aria-label="Recycled rows table">
		<Table.Header>
			<Table.Row>
				<Table.Column id="label" rowHeader textValue="Label">
					<Table.ColumnHeaderCell>Label</Table.ColumnHeaderCell>
				</Table.Column>
			</Table.Row>
		</Table.Header>

		<Table.Body items={rows} virtualizer={{ rowHeight: 32, overscan: 8, recycle }}>
			{#snippet children(row)}
				<Table.Row id={row.id} data-item-id={row.id}>
					<Table.Cell>{row.label}</Table.Cell>
				</Table.Row>
			{/snippet}
		</Table.Body>
	</Table.Root>
</div>
