<script lang="ts">
	import { Calendar } from '@human-kit/ui';

	let value = $state<{ start?: string; end?: string }>({});

	function isWeekend(date: string) {
		const day = new Date(`${date}T00:00:00Z`).getUTCDay();
		return day === 0 || day === 6;
	}
</script>

<Calendar.Root bind:value selectionMode="range" isDateUnavailable={isWeekend} class="space-y-4">
	<div class="flex items-center justify-between gap-3">
		<Calendar.TriggerPrevious
			class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
		>
			Previous
		</Calendar.TriggerPrevious>
		<Calendar.Heading class="text-lg font-semibold text-gray-900 dark:text-white" />
		<Calendar.TriggerNext
			class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
		>
			Next
		</Calendar.TriggerNext>
	</div>

	<Calendar.Grid class="text-gray-900 dark:text-gray-100">
		<Calendar.GridHeader>
			{#snippet children(day)}
				<Calendar.HeaderCell
					class="px-2 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300"
				>
					{day}
				</Calendar.HeaderCell>
			{/snippet}
		</Calendar.GridHeader>
		<Calendar.GridBody>
			{#snippet children(date)}
				<Calendar.BodyCell
					{date}
					class="p-1 text-center text-gray-900 data-disabled:text-red-600 data-in-range:bg-blue-100 data-outside-month:opacity-45 data-range-end:rounded-r data-range-start:rounded-l data-selected:bg-blue-600 data-selected:text-white dark:text-gray-100 dark:data-disabled:text-red-400 dark:data-in-range:bg-blue-900/40"
				/>
			{/snippet}
		</Calendar.GridBody>
	</Calendar.Grid>
</Calendar.Root>

<p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
	Selected: {value.start ?? '—'} → {value.end ?? '—'}
</p>
