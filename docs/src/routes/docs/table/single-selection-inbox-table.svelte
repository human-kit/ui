<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/ui/table';
	import type { TableSelectionKey } from '@human-kit/ui/table';
	import {
		inboxThreads,
		tableSelectionCheckboxClass,
		tableSelectionIndicatorClass
	} from './table-demo-data';

	let inboxSelectedKeys = $state<Set<TableSelectionKey>>(new Set(['billing']));
</script>

<DemoSection
	title="Single Selection Inbox"
	description="A denser inbox-style table where the row selection UI stays explicit, but the header checkbox disappears automatically because the table is in single-selection mode."
>
	<div
		class="w-full overflow-x-auto rounded-2xl border border-gray-300 bg-white p-3 dark:border-gray-700 dark:bg-gray-900"
	>
		<Table.Root
			aria-label="Inbox triage table"
			selectionMode="single"
			selectionBehavior="replace"
			bind:selectedKeys={inboxSelectedKeys}
			class="min-w-full border-collapse text-left"
		>
			<Table.Header>
				<Table.Row class="border-b border-gray-200 dark:border-gray-700">
					<Table.Column id="selection" textValue="Selection" width={64} minWidth={64} maxWidth={64}>
						<Table.ColumnHeaderCell
							class="w-12 px-3 py-3 text-center text-xs font-semibold uppercase tracking-[0.24em] text-gray-400 dark:text-gray-500"
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
						</Table.ColumnHeaderCell>
					</Table.Column>
					<Table.Column id="subject" rowHeader textValue="Subject">
						<Table.ColumnHeaderCell
							class="px-3 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-300"
							>Subject</Table.ColumnHeaderCell
						>
					</Table.Column>
					<Table.Column id="status" textValue="Status">
						<Table.ColumnHeaderCell
							class="px-3 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-300"
							>Status</Table.ColumnHeaderCell
						>
					</Table.Column>
					<Table.Column id="updated" textValue="Updated">
						<Table.ColumnHeaderCell
							class="px-3 py-3 text-xs font-semibold uppercase tracking-[0.24em] text-gray-500 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-300"
							>Updated</Table.ColumnHeaderCell
						>
					</Table.Column>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each inboxThreads as thread (thread.id)}
					<Table.Row
						id={thread.id}
						class="border-b border-gray-100 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 data-selected:bg-blue-50/70 dark:border-gray-800 dark:data-[focus-visible=true]:ring-blue-400 dark:data-selected:bg-blue-950/30"
					>
						<Table.Cell class="w-12 px-3 py-3 text-center">
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
							class="px-3 py-3 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500"
						>
							<div class="flex min-w-0 flex-col gap-1">
								<div
									class="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500"
								>
									<span>{thread.sender}</span>
								</div>
								<div
									class="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white"
								>
									{thread.subject}
								</div>
							</div>
						</Table.Cell>
						<Table.Cell
							class="px-3 py-3 text-sm text-gray-600 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-300"
						>
							<span
								class="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-200"
								>{thread.status}</span
							>
						</Table.Cell>
						<Table.Cell
							class="px-3 py-3 text-sm text-gray-500 outline-none data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-400"
							>{thread.updatedAt}</Table.Cell
						>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>

	{#snippet controls()}
		<div class="space-y-4">
			<p class="text-sm text-gray-600 dark:text-gray-300">
				The first column keeps explicit row checkboxes, but the header checkbox is hidden because
				`selectionMode` is fixed to `single`.
			</p>
			<DemoState label="selectedKeys" value={[...inboxSelectedKeys]} />
		</div>
	{/snippet}
</DemoSection>
