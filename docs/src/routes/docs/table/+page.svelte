<script lang="ts">
	import BehaviorNotesTable from './behavior-notes-table.svelte';
	import DisabledBehaviorTable from './disabled-behavior-table.svelte';
	import FixedWidthContractTable from './fixed-width-contract-table.svelte';
	import ColumnVisibilityTable from './column-visibility-table.svelte';
	import FilteringTable from './filtering-table.svelte';
	import InteractiveTable from './interactive-table.svelte';
	import KeyboardTable from './keyboard-table.svelte';
	import PaginationTable from './pagination-table.svelte';
	import ReadOnlySnapshotEmptyStateTable from './read-only-snapshot-empty-state-table.svelte';
	import RowActionsReplaceTable from './row-actions-replace-table.svelte';
	import RowActionsToggleTable from './row-actions-toggle-table.svelte';
	import SingleSelectionInboxTable from './single-selection-inbox-table.svelte';
	import StickyHeaderTable from './sticky-header-table.svelte';
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-6xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Table</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			Headless interactive table with grid navigation, row selection, and sortable headers.
		</p>

		<div class="space-y-8">
			<InteractiveTable />
			<FixedWidthContractTable />
			<RowActionsToggleTable />
			<RowActionsReplaceTable />
			<DisabledBehaviorTable />
			<SingleSelectionInboxTable />
			<ReadOnlySnapshotEmptyStateTable />
			<StickyHeaderTable />
			<ColumnVisibilityTable />
			<FilteringTable />
			<PaginationTable />
			<KeyboardTable />
			<BehaviorNotesTable />
		</div>
	</div>
</div>
