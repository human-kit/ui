<script lang="ts">
	import { LocaleProvider } from '@human-kit/ui';
	import { DatePicker } from '@human-kit/ui/datepicker';
	import CalendarIcon from '@lucide/svelte/icons/calendar';

	let value = $state<string | null>(null);
</script>

<div class="w-full max-w-xs">
	<LocaleProvider locale="es-AR">
		<DatePicker.Root bind:value class="group space-y-2">
			<div
				class="corner-squircle flex h-8 items-center gap-1 rounded-xl border border-neutral-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-blue-500 dark:border-neutral-600 dark:bg-neutral-700"
			>
				<DatePicker.Input
					aria-label="Date input"
					class="flex min-w-0 flex-1 items-center gap-0.5 text-sm text-neutral-900 dark:text-white"
				>
					{#snippet children(segment)}
						<DatePicker.Segment
							{segment}
							class="inline rounded px-0.5 caret-transparent outline-hidden transition-all data-disabled:cursor-not-allowed data-focused:scale-115 data-focused:ring data-focused:ring-white data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400"
						/>
					{/snippet}
				</DatePicker.Input>
				<DatePicker.Trigger
					class="corner-squircle inline-flex size-5 items-center justify-center rounded-md text-neutral-500 outline-none hover:bg-neutral-100 data-[focus-visible=true]:ring-1 data-[focus-visible=true]:ring-blue-500 dark:text-neutral-300 dark:hover:bg-neutral-600"
				>
					<CalendarIcon class="size-3.5" />
				</DatePicker.Trigger>
			</div>
			<DatePicker.Popover
				placement="bottom"
				class="mt-1 rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
			>
				<DatePicker.Calendar>
					<div class="flex items-center justify-between gap-2 p-2">
						<DatePicker.TriggerPrevious
							class="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
						/>
						<DatePicker.Heading class="text-sm font-medium" />
						<DatePicker.TriggerNext
							class="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
						/>
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
									class="h-8 w-8 rounded-md text-sm text-neutral-900 hover:bg-neutral-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[selected=true]:bg-blue-600 data-[selected=true]:text-white data-[unavailable=true]:opacity-50 dark:text-white dark:hover:bg-neutral-700"
								/>
							{/snippet}
						</DatePicker.GridBody>
					</DatePicker.Grid>
				</DatePicker.Calendar>
			</DatePicker.Popover>
		</DatePicker.Root>
	</LocaleProvider>

	<p class="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Value: {value ?? 'null'}</p>
</div>
