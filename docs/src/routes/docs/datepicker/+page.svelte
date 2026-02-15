<script lang="ts">
	import { LocaleProvider } from '@human-kit/svelte-components';
	import { DatePicker } from '@human-kit/svelte-components/datepicker';
	import { DemoSection, DemoCheckbox, DemoInput, DemoState } from '$lib/demo';

	let value = $state<string | null | undefined>();
	let open = $state(false);
	let isDisabled = $state(false);
	let isReadOnly = $state(false);
	let closeOnSelect = $state(true);
	let minValue = $state('');
	let maxValue = $state('');

	const normalizedMinValue = $derived(minValue.trim().length > 0 ? minValue : undefined);
	const normalizedMaxValue = $derived(maxValue.trim().length > 0 ? maxValue : undefined);

	$inspect({
		value,
		open,
		isDisabled,
		isReadOnly,
		closeOnSelect,
		minValue,
		maxValue
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
				description="Test DatePicker core props interactively"
			>
				<div class="w-full max-w-xs">
					<LocaleProvider locale="es-AR">
						<DatePicker.Root
							bind:value
							bind:open
							{isDisabled}
							{isReadOnly}
							{closeOnSelect}
							minValue={normalizedMinValue}
							maxValue={normalizedMaxValue}
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
						<DemoCheckbox label="isDisabled" bind:checked={isDisabled} />
						<DemoCheckbox label="isReadOnly" bind:checked={isReadOnly} />
						<DemoCheckbox label="closeOnSelect" bind:checked={closeOnSelect} />
						<DemoInput label="minValue" bind:value={minValue} />
						<DemoInput label="maxValue" bind:value={maxValue} />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" {value} />
						<DemoState label="open" value={open} />
					</div>
				{/snippet}
			</DemoSection>
		</div>
	</div>
</div>
