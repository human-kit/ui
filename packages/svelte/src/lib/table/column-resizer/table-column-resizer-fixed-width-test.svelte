<script lang="ts">
	import { Table } from '../index';
	import type { TableColumnWidth } from '../root/context';

	let currentColumnWidths = $state<Map<string, TableColumnWidth>>(new Map());
</script>

<Table.Root aria-label="Fixed width table" bind:columnWidths={currentColumnWidths}>
	<Table.Header>
		<Table.Row>
			<Table.Column
				id="email"
				rowHeader
				textValue="Email"
				width={220}
				minWidth={220}
				maxWidth={220}
			>
				<Table.ColumnHeaderCell>
					<div class="flex items-center justify-between gap-3">
						<span>Email</span>
						<Table.ColumnResizer
							data-testid="fixed-email-resizer"
							class="inline-flex w-3 cursor-col-resize justify-center"
						/>
					</div>
				</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="role" textValue="Role" defaultWidth={180} minWidth={120}>
				<Table.ColumnHeaderCell>
					<div class="flex items-center justify-between gap-3">
						<span>Role</span>
						<Table.ColumnResizer
							data-testid="role-resizer"
							class="inline-flex w-3 cursor-col-resize justify-center"
						/>
					</div>
				</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		<Table.Row id="danilo">
			<Table.Cell>danilo.fernandez+workspace-owner@example.com</Table.Cell>
			<Table.Cell>Developer</Table.Cell>
		</Table.Row>
		<Table.Row id="zahra">
			<Table.Cell>zahra@example.com</Table.Cell>
			<Table.Cell>Admin</Table.Cell>
		</Table.Row>
	</Table.Body>
</Table.Root>

<output data-testid="column-widths"
	>{JSON.stringify(Object.fromEntries(currentColumnWidths))}</output
>
