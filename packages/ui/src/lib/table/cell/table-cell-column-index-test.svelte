<script lang="ts">
	import { Table } from '../index';
</script>

<Table.Root aria-label="Filler row table">
	<Table.Header>
		<Table.Row>
			<Table.Column id="a" rowHeader textValue="A">
				<Table.ColumnHeaderCell>A</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="b" textValue="B">
				<Table.ColumnHeaderCell>B</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="c" textValue="C">
				<Table.ColumnHeaderCell>C</Table.ColumnHeaderCell>
			</Table.Column>
			<Table.Column id="d" textValue="D">
				<Table.ColumnHeaderCell>D</Table.ColumnHeaderCell>
			</Table.Column>
		</Table.Row>
	</Table.Header>
	<Table.Body>
		<!-- Columns b and c are one filler cell, so the last cell is in column d, not in place 3. -->
		<Table.Row id="filler-row" data-row="filler">
			<Table.Cell columnIndex={0}>first</Table.Cell>
			<td colspan="2" aria-hidden="true"></td>
			<Table.Cell columnIndex={3} data-testid="last">last</Table.Cell>
		</Table.Row>
		<Table.Row id="plain-row" data-row="plain">
			<Table.Cell>a</Table.Cell>
			<Table.Cell>b</Table.Cell>
			<Table.Cell>c</Table.Cell>
			<Table.Cell>d</Table.Cell>
		</Table.Row>
	</Table.Body>
</Table.Root>
