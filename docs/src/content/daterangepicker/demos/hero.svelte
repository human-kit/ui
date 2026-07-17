<script lang="ts">
	import { LocaleProvider } from '@human-kit/ui';
	import { DateRangePicker, type DateRangePickerRangeValue } from '@human-kit/ui/daterangepicker';
	import CalendarIcon from '@lucide/svelte/icons/calendar';

	let value = $state<DateRangePickerRangeValue | null>(null);
</script>

<LocaleProvider locale="es-AR">
	<DateRangePicker.Root bind:value class="group w-full max-w-md space-y-2">
		<div
			class="corner-squircle flex min-h-8 flex-wrap items-center gap-1 rounded-md border border-neutral-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:group-data-[focus-within=true]:border-white"
		>
			<DateRangePicker.Input
				part="start"
				aria-label="Start date"
				class="flex min-w-0 items-center gap-0.5 text-sm text-neutral-900 dark:text-white"
			>
				{#snippet children(segment)}
					<DateRangePicker.Segment
						part="start"
						{segment}
						class="inline rounded px-0.5 caret-transparent outline-hidden transition-colors data-disabled:cursor-not-allowed data-focused:bg-neutral-900 data-focused:text-white data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400 dark:data-focused:bg-white dark:data-focused:text-neutral-900"
					/>
				{/snippet}
			</DateRangePicker.Input>
			<span class="px-1 text-sm text-neutral-400" aria-hidden="true">-</span>
			<DateRangePicker.Input
				part="end"
				aria-label="End date"
				class="flex min-w-0 items-center gap-0.5 text-sm text-neutral-900 dark:text-white"
			>
				{#snippet children(segment)}
					<DateRangePicker.Segment
						part="end"
						{segment}
						class="inline rounded px-0.5 caret-transparent outline-hidden transition-colors data-disabled:cursor-not-allowed data-focused:bg-neutral-900 data-focused:text-white data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400 dark:data-focused:bg-white dark:data-focused:text-neutral-900"
					/>
				{/snippet}
			</DateRangePicker.Input>
			<DateRangePicker.Trigger
				class="corner-squircle ml-auto inline-flex size-5 items-center justify-center rounded-md text-neutral-500 outline-none transition-colors hover:bg-neutral-100 data-[focus-visible=true]:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
			>
				<CalendarIcon class="size-3.5" />
			</DateRangePicker.Trigger>
		</div>
		<DateRangePicker.Popover
			placement="bottom"
			class="mt-1 rounded-xl border border-neutral-200 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			<DateRangePicker.Calendar visibleMonths={2}>
				<div class="flex items-center justify-between gap-2 p-2">
					<DateRangePicker.TriggerPrevious
						class="inline-flex size-8 items-center justify-center rounded-md text-neutral-600 outline-none transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
					/>
					<DateRangePicker.Heading class="text-sm font-medium text-neutral-900 dark:text-white" />
					<DateRangePicker.TriggerNext
						class="inline-flex size-8 items-center justify-center rounded-md text-neutral-600 outline-none transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
					/>
				</div>
				<!-- flex lays the two visible months side by side instead of stacked. -->
				<DateRangePicker.Grid
					class="flex items-start justify-center gap-4 border-separate border-spacing-1 px-2 pb-2"
				>
					<DateRangePicker.GridHeader>
						{#snippet children(dayLabel: string)}
							<DateRangePicker.HeaderCell
								class="size-8 text-xs font-medium text-neutral-500 dark:text-neutral-400"
							>
								{dayLabel}
							</DateRangePicker.HeaderCell>
						{/snippet}
					</DateRangePicker.GridHeader>
					<DateRangePicker.GridBody>
						{#snippet children(date: string)}
							<DateRangePicker.BodyCell
								{date}
								class="inline-flex size-8 items-center justify-center rounded-lg text-sm text-neutral-900 outline-none transition-colors hover:bg-neutral-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40 data-[in-range=true]:bg-neutral-100 data-[range-end=true]:bg-neutral-900 data-[range-end=true]:text-white data-[range-start=true]:bg-neutral-900 data-[range-start=true]:text-white dark:text-white dark:hover:bg-neutral-800 dark:data-[in-range=true]:bg-neutral-800 dark:data-[range-end=true]:bg-white dark:data-[range-end=true]:text-neutral-900 dark:data-[range-start=true]:bg-white dark:data-[range-start=true]:text-neutral-900"
							/>
						{/snippet}
					</DateRangePicker.GridBody>
				</DateRangePicker.Grid>
			</DateRangePicker.Calendar>
		</DateRangePicker.Popover>
	</DateRangePicker.Root>
</LocaleProvider>
