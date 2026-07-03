<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/ui/table';
	import { workspaceMembers } from './table-demo-data';

	type ManagedTableWidth = number | `${number}px` | `${number}%` | `${number}fr`;

	let managedColumnWidths = $state<Map<string, ManagedTableWidth> | undefined>(undefined);
	const layoutMode = $derived.by(() => {
		if (!managedColumnWidths) return 'implicit fill column';
		for (const width of managedColumnWidths.values()) {
			if (typeof width === 'string' && (width.endsWith('fr') || width.endsWith('%'))) {
				return 'mixed px + flexible widths';
			}
		}
		return 'fully managed px widths';
	});
	const managedWidthsState = $derived(
		managedColumnWidths ? Object.fromEntries(managedColumnWidths) : 'unmanaged'
	);
</script>

<DemoSection
	title="Fixed Width Contract"
	description="Three-column table without selection checkboxes. Before interaction, `region` starts from a pixel `defaultWidth` while `name` and `plan` share the remaining flexible space. On the first real resize, the table freezes visible widths to px, lets the trailing column absorb the delta until its minimum width, and then overflows horizontally inside the table container."
>
	<div
		class="w-full max-w-200 overflow-x-auto rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
	>
		<Table.Root
			aria-label="Workspace directory table"
			selectionMode="none"
			bind:columnWidths={managedColumnWidths}
			class="min-w-full border-collapse text-left"
		>
			<Table.Header>
				<Table.Row class="border-b border-gray-200 dark:border-gray-700">
					<Table.Column id="name" rowHeader textValue="Name" defaultWidth="100px">
						<Table.ColumnHeaderCell
							class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300"
						>
							<div class="flex min-w-0 items-center justify-between gap-2">
								<span class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
									>Name</span
								>
								<Table.ColumnResizer
									class="inline-flex w-4 shrink-0 cursor-col-resize justify-center rounded-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
								>
									<span class="block h-4 w-0.5 rounded-full bg-current opacity-70"></span>
								</Table.ColumnResizer>
							</div>
						</Table.ColumnHeaderCell>
					</Table.Column>
					<Table.Column id="region" textValue="Region">
						<Table.ColumnHeaderCell
							class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300"
						>
							<div class="flex min-w-0 items-center justify-between gap-2">
								<span class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
									>Region</span
								>
								<Table.ColumnResizer
									class="inline-flex w-4 shrink-0 cursor-col-resize justify-center rounded-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
								>
									<span class="block h-4 w-0.5 rounded-full bg-current opacity-70"></span>
								</Table.ColumnResizer>
							</div>
						</Table.ColumnHeaderCell>
					</Table.Column>
					<Table.Column id="plan" textValue="Plan">
						<Table.ColumnHeaderCell
							class="px-4 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500 dark:text-gray-300"
						>
							<div class="flex min-w-0 items-center justify-between gap-2">
								<span class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
									>Plan</span
								>
								<Table.ColumnResizer
									class="inline-flex w-4 shrink-0 cursor-col-resize justify-center rounded-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
								>
									<span class="block h-4 w-0.5 rounded-full bg-current opacity-70"></span>
								</Table.ColumnResizer>
							</div>
						</Table.ColumnHeaderCell>
					</Table.Column>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each workspaceMembers as member (member.id)}
					<Table.Row class="border-b border-gray-100 dark:border-gray-800">
						<Table.Cell class="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
							<div class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
								{member.name}
							</div>
						</Table.Cell>
						<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
							<div class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
								{member.region}
							</div>
						</Table.Cell>
						<Table.Cell class="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
							<div class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
								{member.plan}
							</div>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	{#snippet controls()}
		<div class="space-y-4 text-sm text-gray-600 dark:text-gray-300">
			<p>
				`selectionMode` is fixed to `none`, so the layout stays at three data columns with no
				selection UI.
			</p>
			<p>
				Before the first drag, `region` starts from a pixel `defaultWidth` while `name` and `plan`
				share the remaining flexible space. Once resizing starts, `Table.Root` materializes widths
				only after a real size change, converts the visible columns to px, lets `plan` absorb the
				delta until its minimum width, and then overflows horizontally inside this panel.
			</p>
			<DemoState label="columns" value="3" />
			<DemoState label="selectionMode" value="none" />
			<DemoState label="name.width" value="implicit fill + resizer" />
			<DemoState label="region.defaultWidth" value="180px uncontrolled + resizer" />
			<DemoState label="plan.width" value="implicit fill + 60px min + resizer" />
			<DemoState label="layoutMode" value={layoutMode} />
			<DemoState label="columnWidths" value={managedWidthsState} />
			<DemoState label="tableWidth" value="min-w-full" />
		</div>
	{/snippet}
</DemoSection>
