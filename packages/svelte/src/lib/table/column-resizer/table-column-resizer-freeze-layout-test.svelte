<script lang="ts">
	import { Table } from '../index';
	import type { TableColumnWidth } from '../root/context';

	let currentColumnWidths = $state<Map<string, TableColumnWidth> | undefined>(undefined);
</script>

<div style="width: 640px;">
	<Table.Root
		aria-label="Freeze layout table"
		bind:columnWidths={currentColumnWidths}
		class="min-w-full border-collapse text-left"
	>
		<Table.Header>
			<Table.Row>
				<Table.Column id="email" isRowHeader textValue="Email" minWidth={80}>
					<Table.ColumnHeaderCell>
						<div class="flex items-center justify-between gap-3">
							<span>Email address</span>
							<Table.ColumnResizer
								data-testid="freeze-email-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="group" textValue="Group" minWidth={80}>
					<Table.ColumnHeaderCell>
						<div class="flex items-center justify-between gap-3">
							<span>Group membership</span>
							<Table.ColumnResizer
								data-testid="freeze-group-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
			</Table.Row>
		</Table.Header>

		<Table.Body>
			<Table.Row id="danilo">
				<Table.Cell>danilo@example.com</Table.Cell>
				<Table.Cell>Developer relations</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
</div>

<output data-testid="freeze-column-widths"
	>{JSON.stringify(Object.fromEntries(currentColumnWidths ?? new Map()))}</output
>
