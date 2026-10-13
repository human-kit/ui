<script lang="ts">
	import { Table } from '../index';
	import type { TableColumnWidth } from '../root/context.svelte';

	let currentColumnWidths = $state<Map<string, TableColumnWidth>>(
		new Map([
			['email', 200],
			['group', 160]
		])
	);
</script>

<Table.Root aria-label="Pinned users table" bind:columnWidths={currentColumnWidths}>
	<Table.Header>
		<Table.Row>
			<Table.Column id="email" rowHeader textValue="Email" minWidth={120}>
				<Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="group" textValue="Group" minWidth={100} maxWidth={260} pin="right">
				<Table.ColumnHeaderCell>
					Group
					<Table.ColumnResizer data-testid="pinned-group-resizer" class="w-3" />
				</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		<Table.Row id="zahra">
			<Table.Cell>zahra@example.com</Table.Cell>
			<Table.Cell>Admin</Table.Cell>
		</Table.Row>
	</Table.Body>
</Table.Root>

<output data-testid="pinned-column-widths"
	>{JSON.stringify(Object.fromEntries(currentColumnWidths))}</output
>
