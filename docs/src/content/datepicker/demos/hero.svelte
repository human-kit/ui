<script lang="ts">
	import { LocaleProvider } from '@human-kit/ui';
	import { DatePicker } from '@human-kit/ui/datepicker';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let value = $state<string | null>(null);
</script>

<div class="w-full max-w-xs">
	<LocaleProvider locale="es-AR">
		<DatePicker.Root bind:value class="group space-y-2">
			<div
				class="flex h-8 items-center gap-1 border border-neutral-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:group-data-[focus-within=true]:border-white"
			>
				<DatePicker.Input
					aria-label="Date input"
					class="flex min-w-0 flex-1 items-center gap-0.5 text-sm text-neutral-900 dark:text-white"
				>
					{#snippet children(segment)}
						<DatePicker.Segment
							{segment}
							class="inline px-0.5 caret-transparent outline-hidden transition-colors data-disabled:cursor-not-allowed data-focused:bg-neutral-900 data-focused:text-white data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400 dark:data-focused:bg-white dark:data-focused:text-neutral-900"
						/>
					{/snippet}
				</DatePicker.Input>
				<DatePicker.Trigger
					class="touch-target inline-flex size-5 items-center justify-center text-neutral-500 outline-none transition-colors hover:bg-neutral-100 data-[focus-visible=true]:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
				>
					<CalendarIcon class="size-3.5" />
				</DatePicker.Trigger>
			</div>
			<DatePicker.Popover
				placement="bottom"
				class="mt-1 border border-neutral-200 bg-white shadow-md dark:border-neutral-800 dark:bg-neutral-900"
			>
				<DatePicker.Calendar>
					<div class="flex items-center justify-between gap-2 p-2">
						<DatePicker.TriggerPrevious
							class="inline-flex size-8 items-center justify-center text-neutral-600 outline-none transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
						>
							<ChevronLeft class="size-4" />
						</DatePicker.TriggerPrevious>
						<DatePicker.Heading class="text-sm font-medium text-neutral-900 dark:text-white" />
						<DatePicker.TriggerNext
							class="inline-flex size-8 items-center justify-center text-neutral-600 outline-none transition-colors hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
						>
							<ChevronRight class="size-4" />
						</DatePicker.TriggerNext>
					</div>
					<DatePicker.Grid class="w-full border-separate border-spacing-1 px-2 pb-2">
						<DatePicker.GridHeader>
							{#snippet children(dayLabel: string)}
								<DatePicker.HeaderCell
									class="h-8 text-xs font-medium text-neutral-500 dark:text-neutral-400"
								>
									{dayLabel}
								</DatePicker.HeaderCell>
							{/snippet}
						</DatePicker.GridHeader>
						<DatePicker.GridBody>
							{#snippet children(date: string)}
								<DatePicker.BodyCell
									{date}
									class="inline-flex size-8 items-center justify-center align-middle text-sm text-neutral-900 outline-none transition-colors hover:bg-neutral-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-40 data-[selected=true]:bg-neutral-900 data-[selected=true]:text-white data-[unavailable=true]:opacity-40 dark:text-white dark:hover:bg-neutral-800 dark:data-[selected=true]:bg-white dark:data-[selected=true]:text-neutral-900"
								/>
							{/snippet}
						</DatePicker.GridBody>
					</DatePicker.Grid>
				</DatePicker.Calendar>
			</DatePicker.Popover>
		</DatePicker.Root>
	</LocaleProvider>

	<p class="mt-4 text-sm text-neutral-500 dark:text-neutral-400">Value: {value ?? 'null'}</p>
</div>
