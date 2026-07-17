<script lang="ts">
	import { Calendar } from '@human-kit/ui';

	let value = $state<{ start?: string; end?: string }>({});

	function isWeekend(date: string) {
		const day = new Date(`${date}T00:00:00Z`).getUTCDay();
		return day === 0 || day === 6;
	}
</script>

<div class="flex flex-col items-center gap-3">
	<Calendar.Root
		bind:value
		selectionMode="range"
		isDateUnavailable={isWeekend}
		class="w-fit rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-900"
	>
		<div class="flex items-center justify-between gap-2 p-2">
			<Calendar.TriggerPrevious
				class="inline-flex size-8 items-center justify-center rounded-md text-neutral-600 outline-none transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
			/>
			<Calendar.Heading class="text-sm font-medium text-neutral-900 dark:text-white" />
			<Calendar.TriggerNext
				class="inline-flex size-8 items-center justify-center rounded-md text-neutral-600 outline-none transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
			/>
		</div>
		<Calendar.Grid class="border-separate border-spacing-1 px-2 pb-2 [&_td]:p-0 [&_th]:p-0">
			<Calendar.GridHeader>
				{#snippet children(day)}
					<Calendar.HeaderCell
						class="size-8 text-center text-xs font-medium text-neutral-500 dark:text-neutral-400"
					>
						{day}
					</Calendar.HeaderCell>
				{/snippet}
			</Calendar.GridHeader>
			<Calendar.GridBody>
				{#snippet children(date)}
					<Calendar.BodyCell
						{date}
						class="inline-flex size-8 items-center justify-center rounded-lg text-sm text-neutral-900 outline-none transition-colors hover:bg-neutral-100 data-disabled:opacity-40 data-in-range:bg-neutral-100 data-outside-month:opacity-40 data-range-end:bg-neutral-900 data-range-end:text-white data-range-start:bg-neutral-900 data-range-start:text-white data-selected:bg-neutral-900 data-selected:text-white dark:text-neutral-100 dark:hover:bg-neutral-800 dark:data-in-range:bg-neutral-800 dark:data-range-end:bg-white dark:data-range-end:text-neutral-900 dark:data-range-start:bg-white dark:data-range-start:text-neutral-900 dark:data-selected:bg-white dark:data-selected:text-neutral-900"
					/>
				{/snippet}
			</Calendar.GridBody>
		</Calendar.Grid>
	</Calendar.Root>

	<p class="text-sm text-neutral-500 dark:text-neutral-400">
		Selected: {value.start ?? '—'} → {value.end ?? '—'}
	</p>
</div>
