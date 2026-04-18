<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/svelte-components/table';
	import type { TableSelectionKey } from '@human-kit/svelte-components/table';
	import {
		tableSelectionCheckboxClass,
		tableSelectionIndicatorClass,
		workspaceMembers
	} from './table-demo-data';

	const rows = workspaceMembers.slice(0, 4);
	const rowClass =
		'border-b border-gray-100 outline-none data-[actionable=true]:cursor-pointer data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-emerald-500 data-selected:bg-emerald-50 dark:border-gray-800 dark:data-selected:bg-emerald-950/30 dark:data-[focus-visible=true]:ring-emerald-400';
	const cellClass =
		'px-3 py-2 text-sm text-gray-700 outline-none data-[actionable=true]:cursor-pointer data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-emerald-500 dark:text-gray-200';

	let selectedKeys = $state<Set<TableSelectionKey>>(new Set());
	let actionLog = $state<string[]>([]);
	let eventLog = $state<string[]>([]);
	let disallowEmptySelection = $state(false);

	function handleSelectionChange(keys: Set<TableSelectionKey>) {
		selectedKeys = new Set(keys);
		eventLog = [`selection:${JSON.stringify([...keys])}`, ...eventLog].slice(0, 6);
	}

	function handleAction(id: TableSelectionKey) {
		actionLog = [String(id), ...actionLog].slice(0, 6);
		eventLog = [`action:${String(id)}`, ...eventLog].slice(0, 6);
	}

	function clearLogs() {
		actionLog = [];
		eventLog = [];
		selectedKeys = new Set();
	}
</script>

<DemoSection
	title="Row Actions in Replace Mode"
	description="Single click selects. Double click runs the row action. Keyboard stays split: Enter runs the action and Space changes selection. Use the event log to verify callback ordering."
>
	<div class="w-full max-w-4xl space-y-4">
		<div
			class="overflow-x-auto rounded-xl border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
		>
			<Table.Root
				aria-label="Replace row actions demo"
				selectionMode="multiple"
				selectionBehavior="replace"
				{disallowEmptySelection}
				bind:selectedKeys
				onSelectionChange={handleSelectionChange}
				onRowAction={handleAction}
				class="min-w-full border-collapse text-left"
			>
				<Table.Header>
					<Table.Row class="border-b border-gray-200 dark:border-gray-700">
						<Table.Column id="selection" textValue="Selection" width={64}>
							<Table.ColumnHeaderCell
								class="w-12 px-3 py-2 text-center text-sm font-semibold text-gray-900 dark:text-white"
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
						<Table.Column id="name" isRowHeader>
							<Table.ColumnHeaderCell
								class="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white"
							>
								Member
							</Table.ColumnHeaderCell>
						</Table.Column>
						<Table.Column id="plan">
							<Table.ColumnHeaderCell
								class="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white"
							>
								Plan
							</Table.ColumnHeaderCell>
						</Table.Column>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{#each rows as member (member.id)}
						<Table.Row id={member.id} class={rowClass}>
							<Table.Cell class="w-12 px-3 py-2 text-center">
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
							<Table.Cell class={cellClass}>
								<div class="font-medium text-gray-900 dark:text-white">{member.name}</div>
								<div class="text-xs text-gray-500 dark:text-gray-400">{member.email}</div>
							</Table.Cell>
							<Table.Cell class={cellClass}>{member.plan}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<div class="grid gap-3 md:grid-cols-3">
			<DemoState label="disallowEmptySelection" value={disallowEmptySelection} />
			<DemoState label="selectedKeys" value={[...selectedKeys]} />
			<DemoState label="actionLog" value={actionLog} />
			<DemoState label="eventLog" value={eventLog} />
		</div>
	</div>

	{#snippet controls()}
		<div class="space-y-4 text-sm text-gray-700 dark:text-gray-200">
			<div class="grid grid-cols-2 gap-2">
				<button
					type="button"
					class="rounded-lg border px-3 py-2 transition data-[active=true]:border-emerald-500 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700 dark:border-gray-700 dark:text-gray-200 dark:data-[active=true]:bg-emerald-950/30 dark:data-[active=true]:text-emerald-200"
					data-active={disallowEmptySelection ? undefined : 'true'}
					onclick={() => {
						disallowEmptySelection = false;
						clearLogs();
					}}
				>
					Allow empty selection
				</button>
				<button
					type="button"
					class="rounded-lg border px-3 py-2 transition data-[active=true]:border-emerald-500 data-[active=true]:bg-emerald-50 data-[active=true]:text-emerald-700 dark:border-gray-700 dark:text-gray-200 dark:data-[active=true]:bg-emerald-950/30 dark:data-[active=true]:text-emerald-200"
					data-active={disallowEmptySelection ? 'true' : undefined}
					onclick={() => {
						disallowEmptySelection = true;
						clearLogs();
					}}
				>
					Disallow empty selection
				</button>
			</div>
			<p>1. Single click a row: it should only select.</p>
			<p>2. Double click the same row: it should select first, then run the action.</p>
			<p>3. Use the event log to confirm the order is `selection` then `action`.</p>
			<p>4. Focus a row and press Enter for action, then Space for selection.</p>
			<p>
				5. When empty selection is allowed, pressing Space on the selected row should clear the
				selection. When disallowed, the same key press should keep one row selected.
			</p>
			<button
				type="button"
				class="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700"
				onclick={clearLogs}
			>
				Clear logs
			</button>
		</div>
	{/snippet}
</DemoSection>
