<script lang="ts">
	import { LocaleProvider } from '@human-kit/svelte-components';
	import { DatePicker } from '@human-kit/svelte-components/datepicker';
	import { DemoSection, DemoCheckbox, DemoState } from '$lib/demo';

	let playgroundValue = $state<string | null | undefined>();
	let playgroundOpen = $state(false);
	let isDisabled = $state(false);
	let isReadOnly = $state(false);
	let closeOnSelect = $state(true);

	let boundedValue = $state<string | null | undefined>();
	let boundedOpen = $state(false);
	const minValue = '2026-02-10';
	const maxValue = '2026-02-20';

	let enUsValue = $state<string | null | undefined>();
	let enUsOpen = $state(false);

	$inspect({
		playgroundValue,
		playgroundOpen,
		isDisabled,
		isReadOnly,
		closeOnSelect,
		boundedValue,
		boundedOpen,
		minValue,
		maxValue,
		enUsValue,
		enUsOpen
	});
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">DatePicker</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			Composable date picker built with segmented input, popover, and calendar.
		</p>

		<div class="space-y-8">
			<DemoSection
				title="Interactive Playground"
				description="Standard DatePicker demo with interactive core controls"
			>
				<div class="w-full max-w-xs">
					<LocaleProvider locale="es-AR">
						<DatePicker.Root
							bind:value={playgroundValue}
							bind:open={playgroundOpen}
							{isDisabled}
							{isReadOnly}
							{closeOnSelect}
							class="group space-y-2"
						>
							<div
								class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors group-data-[focus-within=true]:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
							>
								<DatePicker.Input
									class="flex min-w-0 flex-1 items-center gap-1 text-gray-900 dark:text-white"
								>
									{#snippet children(segment)}
										<DatePicker.Segment
											{segment}
											class="rounded-sm px-0.5 text-sm data-[focus-visible=true]:bg-blue-100 data-[focus-visible=true]:text-blue-900 data-[placeholder=true]:text-gray-400 dark:data-[focus-visible=true]:bg-blue-500/20 dark:data-[focus-visible=true]:text-blue-100 dark:data-[placeholder=true]:text-gray-500"
										/>
									{/snippet}
								</DatePicker.Input>
								<DatePicker.Trigger
									class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-600"
								/>
							</div>
							<DatePicker.Popover
								class="mt-1 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
							>
								<DatePicker.Calendar />
							</DatePicker.Popover>
						</DatePicker.Root>
					</LocaleProvider>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoCheckbox label="isDisabled" bind:checked={isDisabled} />
						<DemoCheckbox label="isReadOnly" bind:checked={isReadOnly} />
						<DemoCheckbox label="closeOnSelect" bind:checked={closeOnSelect} />
						<p class="text-xs text-gray-500 dark:text-gray-400">
							In read-only mode, the calendar trigger is hidden.
						</p>
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" value={playgroundValue} />
						<DemoState label="open" value={playgroundOpen} />
					</div>
				{/snippet}
			</DemoSection>

			<DemoSection title="Min/Max Range" description="DatePicker constrained to a fixed date range">
				<div class="w-full max-w-xs">
					<LocaleProvider locale="es-AR">
						<DatePicker.Root
							bind:value={boundedValue}
							bind:open={boundedOpen}
							{minValue}
							{maxValue}
							class="group space-y-2"
						>
							<div
								class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-blue-500 group-data-[focus-within=true]:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
							>
								<DatePicker.Input
									class="flex min-w-0 flex-1 items-center gap-1 text-gray-900 dark:text-white"
								>
									{#snippet children(segment)}
										<DatePicker.Segment
											{segment}
											class="rounded-sm px-0.5 text-sm data-[focus-visible=true]:bg-blue-100 data-[focus-visible=true]:text-blue-900 data-[placeholder=true]:text-gray-400 dark:data-[focus-visible=true]:bg-blue-500/20 dark:data-[focus-visible=true]:text-blue-100 dark:data-[placeholder=true]:text-gray-500"
										/>
									{/snippet}
								</DatePicker.Input>
								<DatePicker.Trigger
									class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-600"
								/>
							</div>
							<DatePicker.Popover
								class="mt-1 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
							>
								<DatePicker.Calendar />
							</DatePicker.Popover>
						</DatePicker.Root>
					</LocaleProvider>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="minValue" value={minValue} />
						<DemoState label="maxValue" value={maxValue} />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" value={boundedValue} />
						<DemoState label="open" value={boundedOpen} />
					</div>
				{/snippet}
			</DemoSection>

			<DemoSection
				title="Locale en-US"
				description="DatePicker rendered with U.S. locale formatting"
			>
				<div class="w-full max-w-xs">
					<LocaleProvider locale="en-US">
						<DatePicker.Root bind:value={enUsValue} bind:open={enUsOpen} class="group space-y-2">
							<div
								class="flex items-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 transition-colors group-data-[focus-visible=true]:ring-2 group-data-[focus-visible=true]:ring-blue-500 group-data-[focus-within=true]:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
							>
								<DatePicker.Input
									class="flex min-w-0 flex-1 items-center gap-1 text-gray-900 dark:text-white"
								>
									{#snippet children(segment)}
										<DatePicker.Segment
											{segment}
											class="rounded-sm px-0.5 text-sm data-[focus-visible=true]:bg-blue-100 data-[focus-visible=true]:text-blue-900 data-[placeholder=true]:text-gray-400 dark:data-[focus-visible=true]:bg-blue-500/20 dark:data-[focus-visible=true]:text-blue-100 dark:data-[placeholder=true]:text-gray-500"
										/>
									{/snippet}
								</DatePicker.Input>
								<DatePicker.Trigger
									class="inline-flex h-7 w-7 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-600"
								/>
							</div>
							<DatePicker.Popover
								class="mt-1 rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-800"
							>
								<DatePicker.Calendar />
							</DatePicker.Popover>
						</DatePicker.Root>
					</LocaleProvider>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="locale" value="en-US" />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" value={enUsValue} />
						<DemoState label="open" value={enUsOpen} />
					</div>
				{/snippet}
			</DemoSection>
		</div>
	</div>
</div>
