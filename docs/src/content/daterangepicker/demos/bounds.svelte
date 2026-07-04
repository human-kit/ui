<script lang="ts">
	import { LocaleProvider } from '@human-kit/ui';
	import { DateRangePicker, type DateRangePickerRangeValue } from '@human-kit/ui/daterangepicker';
	import CalendarIcon from '@lucide/svelte/icons/calendar';

	let value = $state<DateRangePickerRangeValue | null>(null);
	const minValue = '2026-02-10';
	const maxValue = '2026-02-20';
</script>

<LocaleProvider locale="es-AR">
	<DateRangePicker.Root bind:value {minValue} {maxValue} class="group w-full max-w-md space-y-2">
		<div
			class="corner-squircle flex min-h-8 flex-wrap items-center gap-1 rounded-xl border border-gray-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
		>
			<DateRangePicker.Input
				part="start"
				aria-label="Start date"
				class="flex items-center gap-0.5 text-sm text-gray-900 dark:text-white"
			/>
			<span class="px-1 text-sm text-gray-400" aria-hidden="true">-</span>
			<DateRangePicker.Input
				part="end"
				aria-label="End date"
				class="flex items-center gap-0.5 text-sm text-gray-900 dark:text-white"
			/>
			<DateRangePicker.Trigger
				class="corner-squircle ml-auto inline-flex size-5 items-center justify-center rounded-md text-gray-500 outline-none hover:bg-gray-100 data-[focus-visible=true]:ring-1 data-[focus-visible=true]:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-600"
			>
				<CalendarIcon class="size-3.5" />
			</DateRangePicker.Trigger>
		</div>
		<DateRangePicker.Popover
			placement="bottom"
			class="mt-1 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			<DateRangePicker.Calendar>
				<div class="flex items-center justify-between gap-2 p-2">
					<DateRangePicker.TriggerPrevious />
					<DateRangePicker.Heading class="text-sm font-medium" />
					<DateRangePicker.TriggerNext />
				</div>
				<DateRangePicker.Grid class="w-full border-separate border-spacing-1 px-2 pb-2">
					<DateRangePicker.GridHeader>
						{#snippet children(dayLabel: string)}
							<DateRangePicker.HeaderCell>{dayLabel}</DateRangePicker.HeaderCell>
						{/snippet}
					</DateRangePicker.GridHeader>
					<DateRangePicker.GridBody>
						{#snippet children(date: string)}
							<DateRangePicker.BodyCell
								{date}
								class="h-8 w-8 rounded-md text-sm text-gray-900 hover:bg-gray-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[in-range=true]:bg-blue-100 data-[range-end=true]:bg-blue-600 data-[range-end=true]:text-white data-[range-start=true]:bg-blue-600 data-[range-start=true]:text-white dark:text-white dark:hover:bg-gray-700 dark:data-[in-range=true]:bg-blue-900"
							/>
						{/snippet}
					</DateRangePicker.GridBody>
				</DateRangePicker.Grid>
			</DateRangePicker.Calendar>
		</DateRangePicker.Popover>
	</DateRangePicker.Root>
</LocaleProvider>

<p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
	Selectable range: {minValue} → {maxValue} — value: {value
		? `${value.start} → ${value.end}`
		: 'null'}
</p>
