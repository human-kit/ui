<script lang="ts">
	import { DemoSection, DemoState } from '$lib/demo';
	import { Table } from '@human-kit/ui/table';
	import type { TableDisabledBehavior, TableSelectionKey } from '@human-kit/ui/table';
	import {
		tableSelectionCheckboxClass,
		tableSelectionIndicatorClass,
		users
	} from './table-demo-data';

	const rows = users.slice(0, 4);
	const disabledKeys = ['zahra'];
	const description =
		'Compare `disabledBehavior="selection"` and `disabledBehavior="all"`. The row with id `zahra` is disabled. In selection mode, its checkbox is disabled but the row still supports focus and actions. In all mode, the row becomes fully non-interactive.';

	let disabledBehavior = $state<TableDisabledBehavior>('selection');
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

<DemoSection title="Disabled Behavior" {description}>
	<div class="w-full max-w-4xl space-y-4">
		<div
			class="overflow-x-auto rounded-xl border border-gray-300 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
		>
			<Table.Root
				aria-label="Disabled behavior demo"
				selectionMode="multiple"
				selectionBehavior="toggle"
				{disabledBehavior}
				{disabledKeys}
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
						<Table.Row
							id={user.id}
							class="border-b border-gray-100 outline-none data-[actionable=true]:cursor-pointer data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-amber-500 data-selected:bg-amber-50 data-selection-disabled:bg-amber-50/60 data-disabled:bg-gray-100 data-disabled:text-gray-400 dark:border-gray-800 dark:data-selected:bg-amber-950/30 dark:data-selection-disabled:bg-amber-950/20 dark:data-disabled:bg-gray-800 dark:data-disabled:text-gray-500"
						>
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
							<Table.Cell
								class="px-3 py-2 text-sm text-gray-700 outline-none data-[actionable=true]:cursor-pointer data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-amber-500 dark:text-gray-200"
							>
								{user.email}
							</Table.Cell>
							<Table.Cell
								class="px-3 py-2 text-sm text-gray-700 outline-none data-[actionable=true]:cursor-pointer data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-inset data-[focus-visible=true]:ring-amber-500 dark:text-gray-200"
							>
								{user.group}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>

		<div class="grid gap-3 md:grid-cols-3">
			<DemoState label="disabledBehavior" value={disabledBehavior} />
			<DemoState label="selectedKeys" value={[...selectedKeys]} />
			<DemoState label="actionLog" value={actionLog} />
		</div>
	</div>

	{#snippet controls()}
		<div class="space-y-4 text-sm text-gray-700 dark:text-gray-200">
			<div class="grid grid-cols-2 gap-2">
				<button
					type="button"
					class="rounded-lg border px-3 py-2 transition data-[active=true]:border-amber-500 data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700 dark:border-gray-700 dark:text-gray-200 dark:data-[active=true]:bg-amber-950/30 dark:data-[active=true]:text-amber-200"
					data-active={disabledBehavior === 'selection' ? 'true' : undefined}
					onclick={() => {
						disabledBehavior = 'selection';
						resetState();
					}}
				>
					selection
				</button>
				<button
					type="button"
					class="rounded-lg border px-3 py-2 transition data-[active=true]:border-amber-500 data-[active=true]:bg-amber-50 data-[active=true]:text-amber-700 dark:border-gray-700 dark:text-gray-200 dark:data-[active=true]:bg-amber-950/30 dark:data-[active=true]:text-amber-200"
					data-active={disabledBehavior === 'all' ? 'true' : undefined}
					onclick={() => {
						disabledBehavior = 'all';
						resetState();
					}}
				>
					all
				</button>
			</div>

			<p>The row for `zahra` is disabled.</p>
			<p>
				In `selection`, its checkbox should be disabled but clicking the row or pressing Enter still
				triggers the action.
			</p>
			<p>In `all`, the same row should stop being focusable and should not run actions.</p>
		</div>
	{/snippet}
</DemoSection>
