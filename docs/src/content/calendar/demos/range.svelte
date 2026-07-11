<script lang="ts">
	import { Calendar } from '@human-kit/svelte-components';

	let value = $state<{ start?: string; end?: string }>({});

	function isWeekend(date: string) {
		const day = new Date(`${date}T00:00:00Z`).getUTCDay();
		return day === 0 || day === 6;
	}
</script>

<Calendar.Root bind:value selectionMode="range" isDateUnavailable={isWeekend} class="space-y-4">
	<div class="flex items-center justify-between gap-3">
		<Calendar.TriggerPrevious
			class="rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
		>
			Previous
		</Calendar.TriggerPrevious>
		<Calendar.Heading class="text-lg font-semibold text-neutral-900 dark:text-white" />
		<Calendar.TriggerNext
			class="rounded border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
		>
			Next
		</Calendar.TriggerNext>
	</div>

	<Calendar.Grid class="text-neutral-900 dark:text-neutral-100">
		<Calendar.GridHeader>
			{#snippet children(day)}
				<Calendar.HeaderCell
					class="px-2 py-1 text-center text-xs font-medium text-neutral-600 dark:text-neutral-300"
				>
					{day}
				</Calendar.HeaderCell>
			{/snippet}
		</Calendar.GridHeader>
		<Calendar.GridBody>
			{#snippet children(date)}
				<Calendar.BodyCell
					{date}
					class="p-1 text-center text-neutral-900 data-disabled:text-red-600 data-in-range:bg-blue-100 data-outside-month:opacity-45 data-range-end:rounded-r data-range-start:rounded-l data-selected:bg-blue-600 data-selected:text-white dark:text-neutral-100 dark:data-disabled:text-red-400 dark:data-in-range:bg-blue-900/40"
				/>
			{/snippet}
		</Calendar.GridBody>
	</Calendar.Grid>
</Calendar.Root>

<p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">
	Selected: {value.start ?? '—'} → {value.end ?? '—'}
</p>
