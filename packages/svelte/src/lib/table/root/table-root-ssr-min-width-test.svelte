<script lang="ts">
	import { Table } from '../index';
</script>

<Table.Root aria-label="SSR reserved width table" ssrMinTableWidth={1058}>
	<Table.Header>
		<Table.Row>
			<Table.Column id="index" textValue="#" width={48}>
				<Table.ColumnHeaderCell>#</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="label" rowHeader textValue="Label" defaultWidth={350} minWidth={280}>
				<Table.ColumnHeaderCell>
					<span>Label</span>
					<Table.ColumnResizer />
				</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="note" textValue="Note" minWidth={200}>
				<Table.ColumnHeaderCell>
					<span>Note</span>
					<Table.ColumnResizer />
				</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>

	<Table.Body>
		<Table.Row id="row-1">
			<Table.Cell>1</Table.Cell>
			<Table.Cell>Service item</Table.Cell>
			<Table.Cell>Some observation</Table.Cell>
		</Table.Row>
	</Table.Body>
</Table.Root>
