<script lang="ts">
	import { Table } from '../index';
	import type { TableColumnWidth } from '../root/context';

	let currentColumnWidths = $state<Map<string, TableColumnWidth> | undefined>(undefined);

	const checkboxStyle =
		'display:inline-flex;height:20px;width:20px;align-items:center;justify-content:center;border:1px solid currentColor;border-radius:4px;';
	const indicatorStyle =
		'display:inline-flex;height:14px;width:14px;align-items:center;justify-content:center;';
</script>

<div style="width: 760px;">
	<Table.Root
		aria-label="Resizable table with selection column"
		selectionMode="multiple"
		bind:columnWidths={currentColumnWidths}
		class="min-w-full border-collapse text-left"
	>
		<Table.Header>
			<Table.Row>
				<Table.Column id="selection" textValue="Selection" width={64} minWidth={64} maxWidth={64}>
					<Table.ColumnHeaderCell data-testid="selection-header-cell">
						<Table.Checkbox style={checkboxStyle} data-testid="selection-header-checkbox">
							<Table.CheckboxIndicator style={indicatorStyle}>
								<svg aria-hidden="true" viewBox="0 0 16 16" style="height:14px;width:14px;">
									<path
										d="M3.75 8.5 6.75 11.5 12.25 5.5"
										fill="none"
										stroke="currentColor"
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
									/>
								</svg>
							</Table.CheckboxIndicator>
						</Table.Checkbox>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="email" rowHeader textValue="Email" minWidth={120}>
					<Table.ColumnHeaderCell>
						<div class="flex items-center justify-between gap-3">
							<span>Email</span>
							<Table.ColumnResizer
								data-testid="selection-email-resizer"
								class="inline-flex w-3 cursor-col-resize justify-center"
							/>
						</div>
					</Table.ColumnHeaderCell>
				</Table.Column>
				<Table.Column id="group" textValue="Group" minWidth={100} maxWidth={260}>
					<Table.ColumnHeaderCell>Group</Table.ColumnHeaderCell>
				</Table.Column>
			</Table.Row>
		</Table.Header>

		<Table.Body>
			<Table.Row id="danilo">
				<Table.Cell>
					<Table.Checkbox style={checkboxStyle} data-testid="selection-row-checkbox">
						<Table.CheckboxIndicator style={indicatorStyle}>
							<svg aria-hidden="true" viewBox="0 0 16 16" style="height:14px;width:14px;">
								<path
									d="M3.75 8.5 6.75 11.5 12.25 5.5"
									fill="none"
									stroke="currentColor"
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
								/>
							</svg>
						</Table.CheckboxIndicator>
					</Table.Checkbox>
				</Table.Cell>
				<Table.Cell>danilo@example.com</Table.Cell>
				<Table.Cell>Developer</Table.Cell>
			</Table.Row>
		</Table.Body>
	</Table.Root>
</div>

<output data-testid="selection-column-widths"
	>{JSON.stringify(Object.fromEntries(currentColumnWidths ?? new Map()))}</output
>
