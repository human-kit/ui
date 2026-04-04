<script lang="ts">
	import { Table } from '../index';
	import type { TableSortDescriptor } from '../root/context';

	let currentColumnWidths = $state<Map<string, number>>(
		new Map([
			['email', 200],
			['group', 160]
		])
	);
	let currentSortDescriptor = $state<TableSortDescriptor | undefined>(undefined);
</script>

<Table.Root
	aria-label="Resizable users table"
	bind:columnWidths={currentColumnWidths}
	bind:sortDescriptor={currentSortDescriptor}
>
	<Table.Header>
		<Table.Row>
			<Table.Column id="email" isRowHeader allowsResizing textValue="Email" minWidth={120}>
				<Table.ColumnHeaderCell>
					<div class="flex items-center justify-between gap-3">
						<span>Email</span>
						<Table.ColumnResizer
							data-testid="email-resizer"
							class="inline-flex w-3 cursor-col-resize justify-center"
						/>
					</div>
				</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column
				id="group"
				allowsSorting
				allowsResizing
				textValue="Group"
				minWidth={100}
				maxWidth={260}
			>
				<Table.ColumnHeaderCell>
					<div class="flex items-center justify-between gap-3">
						<span>Group</span>
						<Table.ColumnResizer
							data-testid="group-resizer"
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
<output data-testid="sort-descriptor"
	>{currentSortDescriptor
		? `${currentSortDescriptor.column}:${currentSortDescriptor.direction}`
		: ''}</output
>
