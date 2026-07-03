<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/svelte-components/table';
	import {
		deploymentRuns,
		tableSelectionCheckboxClass,
		tableSelectionIndicatorClass
	} from './table-demo-data';

	type StickyDeploymentRun = (typeof deploymentRuns)[number] & { stickyId: string };

	const stickyDeploymentRuns: StickyDeploymentRun[] = Array.from({ length: 100 }, (_, index) => {
		const run = deploymentRuns[index % deploymentRuns.length];
		const hour = 9 + Math.floor(index / 12);
		const minute = (12 + index * 7) % 60;

		return {
			...run,
			stickyId: `${run.id}-${index + 1}`,
			service: `${run.service} #${index + 1}`,
			updatedAt: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
		};
	});

	const stickyColumns = [
		{ id: 'selection', label: 'Select', width: 64, minWidth: 64, maxWidth: 64 },
		{ id: 'service', label: 'Service', defaultWidth: 220, minWidth: 180 },
		{ id: 'owner', label: 'Owner', defaultWidth: 160, minWidth: 140 },
		{ id: 'region', label: 'Region', defaultWidth: 150, minWidth: 130 },
		{ id: 'status', label: 'Status', defaultWidth: 150, minWidth: 130 },
		{ id: 'updatedAt', label: 'Updated', defaultWidth: 140, minWidth: 120 }
	] as const;

	const stickyColumnWidths = new Map(
		stickyColumns
			.filter((column) => 'defaultWidth' in column)
			.map((column) => [column.id, column.defaultWidth])
	);
</script>

<DemoSection
	title="Sticky Header"
	description="A consumer-owned sticky header pattern: the scroll container owns overflow, and header cells opt into `position: sticky` with their own background and z-index."
>
	<div
		class="w-full rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
	>
		<div class="h-80 overflow-auto rounded-xl border border-gray-200 dark:border-gray-800">
			<Table.Root
				aria-label="Sticky deployment runs table"
				selectionMode="multiple"
				defaultColumnWidths={stickyColumnWidths}
				class="min-w-full border-separate border-spacing-0 text-left"
			>
				<Table.Header>
					<Table.Row>
						{#each stickyColumns as column (column.id)}
							<Table.Column
								id={column.id}
								rowHeader={column.id === 'service'}
								textValue={column.label}
								width={'width' in column ? column.width : undefined}
								defaultWidth={'defaultWidth' in column ? column.defaultWidth : undefined}
								minWidth={column.minWidth}
								maxWidth={'maxWidth' in column ? column.maxWidth : undefined}
							>
								<Table.ColumnHeaderCell
									class="sticky top-0 z-10 border-b border-r border-gray-200 bg-white/95 pl-4 pr-0 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 backdrop-blur last:border-r-0 dark:border-gray-700 dark:bg-gray-900/95 dark:text-gray-300"
								>
									{#if column.id === 'selection'}
										<div class="flex items-center justify-center pr-4">
											<Table.Checkbox class={tableSelectionCheckboxClass}>
												<Table.CheckboxIndicator class={tableSelectionIndicatorClass}>
													<svg aria-hidden="true" viewBox="0 0 16 16" class="h-3.5 w-3.5">
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
										</div>
									{:else}
										<div class="flex min-w-0 items-center justify-between gap-2">
											<span class="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap"
												>{column.label}</span
											>
											<Table.ColumnResizer
												class="inline-flex w-4 shrink-0 cursor-col-resize justify-center rounded-sm text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
											>
												<span class="block h-4 w-0.5 rounded-full bg-current opacity-60"></span>
											</Table.ColumnResizer>
										</div>
									{/if}
								</Table.ColumnHeaderCell>
							</Table.Column>
						{/each}
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each stickyDeploymentRuns as run (run.stickyId)}
						<Table.Row id={run.stickyId}>
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-center last:border-r-0 dark:border-gray-800"
							>
								<Table.Checkbox class={tableSelectionCheckboxClass}>
									<Table.CheckboxIndicator class={tableSelectionIndicatorClass}>
										<svg aria-hidden="true" viewBox="0 0 16 16" class="h-3.5 w-3.5">
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
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-sm font-medium whitespace-nowrap text-gray-900 last:border-r-0 dark:border-gray-800 dark:text-white"
								>{run.service}</Table.Cell
							>
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-sm whitespace-nowrap text-gray-600 last:border-r-0 dark:border-gray-800 dark:text-gray-300"
								>{run.owner}</Table.Cell
							>
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-sm whitespace-nowrap text-gray-500 last:border-r-0 dark:border-gray-800 dark:text-gray-400"
								>{run.region}</Table.Cell
							>
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-sm whitespace-nowrap text-gray-600 last:border-r-0 dark:border-gray-800 dark:text-gray-300"
								><span
									class="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
									>{run.status}</span
								></Table.Cell
							>
							<Table.Cell
								class="border-b border-r border-gray-200 px-4 py-3 text-sm whitespace-nowrap text-gray-500 last:border-r-0 dark:border-gray-800 dark:text-gray-400"
								>{run.updatedAt}</Table.Cell
							>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>

	{#snippet controls()}
		<div class="space-y-4 text-sm text-gray-600 dark:text-gray-300">
			<p>
				The sticky behavior still comes from the scroll shell plus sticky header cell classes; this
				variant adds a fixed selection column and enough rows to stress the scroll behavior.
			</p>
			<DemoState label="rows" value={stickyDeploymentRuns.length} />
			<DemoState label="selectionMode" value="multiple" />
			<DemoState label="scrollContainer" value="h-80 + overflow-auto" />
			<DemoState label="tableLayout" value="border-separate border-spacing-0" />
		</div>
	{/snippet}
</DemoSection>
