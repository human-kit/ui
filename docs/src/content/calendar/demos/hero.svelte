<script lang="ts">
	import { Calendar } from '@human-kit/ui';

	let value = $state('');
</script>

<Calendar.Root bind:value selectionMode="single" class="space-y-4">
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
					class="p-1 text-center text-neutral-900 data-outside-month:opacity-45 data-selected:rounded data-selected:bg-blue-600 data-selected:text-white dark:text-neutral-100"
				/>
			{/snippet}
		</Calendar.GridBody>
	</Calendar.Grid>
</Calendar.Root>
