<script lang="ts">
	import { LocaleProvider } from '@human-kit/ui';
	import { DateRangePicker, type DateRangePickerRangeValue } from '@human-kit/ui/daterangepicker';
	import { DemoSection, DemoCheckbox, DemoState } from '$lib/demo';
	import CalendarIcon from '@lucide/svelte/icons/calendar';

	let playgroundValue = $state<DateRangePickerRangeValue | null>(null);
	let playgroundOpen = $state(false);
	let isDisabled = $state(false);
	let isReadOnly = $state(false);
	let closeOnSelect = $state(true);

	let boundedValue = $state<DateRangePickerRangeValue | null>(null);
	let boundedOpen = $state(false);
	const minValue = '2026-02-10';
	const maxValue = '2026-02-20';

	function formatRange(value: DateRangePickerRangeValue | null): string {
		if (!value) return '';
		return `${value.start} - ${value.end}`;
	}

	function handleChange(value: DateRangePickerRangeValue | null) {
		console.log('DateRangePicker onChange:', value);
	}
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">DateRangePicker</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			Composable date range picker built with segmented inputs, popover, and range calendar.
		</p>

		<div class="space-y-8">
			<DemoSection
				title="Interactive Playground"
				description="Standard DateRangePicker demo with interactive core controls"
			>
				<div class="w-full max-w-md">
					<LocaleProvider locale="es-AR">
						<DateRangePicker.Root
							bind:value={playgroundValue}
							bind:open={playgroundOpen}
							onChange={handleChange}
							disabled={isDisabled}
							readonly={isReadOnly}
							{closeOnSelect}
							class="group space-y-2"
						>
							<div
								class="corner-squircle flex min-h-8 flex-wrap items-center gap-1 rounded-xl border border-gray-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
							>
								<DateRangePicker.Input
									part="start"
									aria-label="Start date"
									class="flex min-w-0 items-center gap-0.5 text-sm text-gray-900 dark:text-white"
								>
									{#snippet children(segment)}
										<DateRangePicker.Segment
											part="start"
											{segment}
											class="data-focused:data-placeholder:text-foreground data-focused:text-foreground inline rounded px-0.5 caret-transparent outline-hidden transition-all data-disabled:cursor-not-allowed data-focused:scale-115 data-focused:ring data-focused:inset-shadow-2xs data-focused:ring-white data-focused:backdrop-blur-md data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400"
										/>
									{/snippet}
								</DateRangePicker.Input>
								<span class="px-1 text-sm text-gray-400" aria-hidden="true">-</span>
								<DateRangePicker.Input
									part="end"
									aria-label="End date"
									class="flex min-w-0 items-center gap-0.5 text-sm text-gray-900 dark:text-white"
								>
									{#snippet children(segment)}
										<DateRangePicker.Segment
											part="end"
											{segment}
											class="data-focused:data-placeholder:text-foreground data-focused:text-foreground inline rounded px-0.5 caret-transparent outline-hidden transition-all data-disabled:cursor-not-allowed data-focused:scale-115 data-focused:ring data-focused:inset-shadow-2xs data-focused:ring-white data-focused:backdrop-blur-md data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400"
										/>
									{/snippet}
								</DateRangePicker.Input>
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
								<DateRangePicker.Calendar visibleMonths={2}>
									<div class="flex items-center justify-between gap-2 p-2">
										<DateRangePicker.TriggerPrevious
											class="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
										/>
										<DateRangePicker.Heading class="text-sm font-medium" />
										<DateRangePicker.TriggerNext
											class="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
										/>
									</div>
									<DateRangePicker.Grid class="w-full border-separate border-spacing-1 px-2 pb-2">
										<DateRangePicker.GridHeader>
											{#snippet children(dayLabel: string)}
												<DateRangePicker.HeaderCell
													class="h-8 text-xs font-medium text-gray-500 dark:text-gray-400"
												>
													{dayLabel}
												</DateRangePicker.HeaderCell>
											{/snippet}
										</DateRangePicker.GridHeader>
										<DateRangePicker.GridBody>
											{#snippet children(date: string)}
												<DateRangePicker.BodyCell
													{date}
													class="h-8 w-8 rounded-md text-sm text-gray-900 hover:bg-gray-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[disabled=true]:hover:bg-transparent data-[in-range=true]:bg-blue-100 data-[range-end=true]:bg-blue-600 data-[range-end=true]:text-white data-[range-start=true]:bg-blue-600 data-[range-start=true]:text-white data-[unavailable=true]:opacity-50 dark:text-white dark:hover:bg-gray-700 dark:data-[disabled=true]:hover:bg-transparent dark:data-[in-range=true]:bg-blue-900"
												/>
											{/snippet}
										</DateRangePicker.GridBody>
									</DateRangePicker.Grid>
								</DateRangePicker.Calendar>
							</DateRangePicker.Popover>
						</DateRangePicker.Root>
					</LocaleProvider>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoCheckbox label="disabled" bind:checked={isDisabled} />
						<DemoCheckbox label="readonly" bind:checked={isReadOnly} />
						<DemoCheckbox label="closeOnSelect" bind:checked={closeOnSelect} />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" value={formatRange(playgroundValue)} />
						<DemoState label="open" value={playgroundOpen} />
					</div>
				{/snippet}
			</DemoSection>

			<DemoSection
				title="Min/Max Range"
				description="DateRangePicker constrained to a fixed date range"
			>
				<div class="w-full max-w-md">
					<LocaleProvider locale="es-AR">
						<DateRangePicker.Root
							bind:value={boundedValue}
							bind:open={boundedOpen}
							{minValue}
							{maxValue}
							class="group space-y-2"
						>
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
													class="h-8 w-8 rounded-md text-sm text-gray-900 hover:bg-gray-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[disabled=true]:hover:bg-transparent data-[in-range=true]:bg-blue-100 data-[range-end=true]:bg-blue-600 data-[range-end=true]:text-white data-[range-start=true]:bg-blue-600 data-[range-start=true]:text-white data-[unavailable=true]:opacity-50 dark:text-white dark:hover:bg-gray-700 dark:data-[disabled=true]:hover:bg-transparent dark:data-[in-range=true]:bg-blue-900"
												/>
											{/snippet}
										</DateRangePicker.GridBody>
									</DateRangePicker.Grid>
								</DateRangePicker.Calendar>
							</DateRangePicker.Popover>
						</DateRangePicker.Root>
					</LocaleProvider>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="minValue" value={minValue} />
						<DemoState label="maxValue" value={maxValue} />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" value={formatRange(boundedValue)} />
						<DemoState label="open" value={boundedOpen} />
					</div>
				{/snippet}
			</DemoSection>
		</div>
	</div>
</div>
