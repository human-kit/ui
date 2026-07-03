<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/ui/table';
	import type { TableSelectionKey, TableSelectionMode } from '@human-kit/ui/table';
	import {
		tableSelectionCheckboxClass,
		tableSelectionIndicatorClass,
		users
	} from './table-demo-data';

	const rows = users.slice(0, 4);
	const rowClass =
		'border-b border-gray-100 outline-none data-[actionable=true]:cursor-pointer data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 data-selected:bg-blue-50 dark:border-gray-800 dark:data-selected:bg-blue-950/40 dark:data-[focus-visible=true]:ring-blue-400';
	const cellClass =
		'px-3 py-2 text-sm text-gray-700 outline-none data-[actionable=true]:cursor-pointer data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-blue-500 dark:text-gray-200';

	let selectionMode = $state<TableSelectionMode>('multiple');
	let selectedKeys = $state<Set<TableSelectionKey>>(new Set());
	let actionLog = $state<string[]>([]);

	function handleAction(id: TableSelectionKey) {
		actionLog = [String(id), ...actionLog].slice(0, 6);
	}

	function resetState() {
		selectedKeys = new Set();
		actionLog = [];
	}
</script>

<DemoSection
	title="Row Actions in Toggle Mode"
	description="Manual test lab for the RAC-style toggle model. With no active selection, row click runs the action. Once you enter selection mode with a checkbox or Space, row click switches to selection toggling. Enter always runs the action."
>
	<div class="w-full max-w-4xl space-y-4">
		<div
			class="overflow-x-auto rounded-xl border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
		>
			<Table.Root
				aria-label="Toggle row actions demo"
				{selectionMode}
				selectionBehavior="toggle"
				bind:selectedKeys
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
						<Table.Column id="email" rowHeader>
							<Table.ColumnHeaderCell
								class="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white"
							>
								Email
							</Table.ColumnHeaderCell>
						</Table.Column>
						<Table.Column id="group">
							<Table.ColumnHeaderCell
								class="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white"
							>
								Group
							</Table.ColumnHeaderCell>
						</Table.Column>
					</Table.Row>
				</Table.Header>

				<Table.Body>
					{#each rows as user (user.id)}
						<Table.Row id={user.id} class={rowClass}>
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
							<Table.Cell class={cellClass}>{user.email}</Table.Cell>
							<Table.Cell class={cellClass}>{user.group}</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<div class="grid gap-3 md:grid-cols-2">
			<DemoState label="selectionMode" value={selectionMode} />
			<DemoState label="selectedKeys" value={[...selectedKeys]} />
			<DemoState label="actionLog" value={actionLog} />
			<div
				class="rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-gray-800 dark:text-gray-200"
			>
				<p class="font-medium text-gray-900 dark:text-white">Try this</p>
				<p class="mt-1">1. Click a row with empty selection: it should run the action.</p>
				<p>2. Select a row with Space or the checkbox.</p>
				<p>3. Click another row: it should toggle selection instead of running the action.</p>
				<p>4. Focus any row and press Enter: it should always run the action.</p>
			</div>
		</div>
	</div>

	{#snippet controls()}
		<div class="space-y-4">
			<div class="space-y-2">
				<p class="text-xs font-medium uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">
					Selection mode
				</p>
				<div class="grid grid-cols-3 gap-2">
					{#each ['none', 'single', 'multiple'] as mode (mode)}
						<button
							type="button"
							class="rounded-lg border px-3 py-2 text-sm transition data-[active=true]:border-blue-500 data-[active=true]:bg-blue-50 data-[active=true]:text-blue-700 dark:border-gray-700 dark:text-gray-200 dark:data-[active=true]:bg-blue-950/40 dark:data-[active=true]:text-blue-200"
							data-active={selectionMode === mode ? 'true' : undefined}
							onclick={() => {
								selectionMode = mode as TableSelectionMode;
								selectedKeys = new Set();
							}}
						>
							{mode}
						</button>
					{/each}
				</div>
			</div>

			<button
				type="button"
				class="w-full rounded-lg border px-3 py-2 text-sm dark:border-gray-700 dark:text-gray-200"
				onclick={resetState}
			>
				Clear selection and logs
			</button>
		</div>
	{/snippet}
</DemoSection>
