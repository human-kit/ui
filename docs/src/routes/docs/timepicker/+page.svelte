<script lang="ts">
	import { LocaleProvider } from '@human-kit/svelte-components';
	import { TimePicker } from '@human-kit/svelte-components/timepicker';
	import { DemoSection, DemoCheckbox, DemoState } from '$lib/demo';

	let playgroundValue = $state<string | null>(null);
	let playgroundOpen = $state(false);
	let isDisabled = $state(false);
	let isReadOnly = $state(false);
	let hourCycle = $state<12 | 24>(24);
	let granularity = $state<'hour' | 'minute' | 'second'>('minute');

	let boundedValue = $state<string | null>('09:30');
	let boundedOpen = $state(false);
	const minValue = '09:00';
	const maxValue = '17:00';

	let usValue = $state<string | null>('14:45');
	let usOpen = $state(false);
</script>

<div class="min-h-screen bg-gray-100 p-8 dark:bg-gray-950">
	<div class="mx-auto max-w-5xl">
		<h1 class="mb-2 text-3xl font-bold text-gray-900 dark:text-white">TimePicker</h1>
		<p class="mb-8 text-gray-600 dark:text-gray-400">
			Composable time picker with segmented input, trigger, and wheel-based panel columns.
		</p>

		<div class="space-y-8">
			<DemoSection
				title="Interactive Playground"
				description="Try hourCycle, granularity, and state flags"
			>
				<div class="w-full max-w-xs">
					<LocaleProvider locale="es-AR">
						<TimePicker.Root
							bind:value={playgroundValue}
							bind:open={playgroundOpen}
							{hourCycle}
							{granularity}
							{isDisabled}
							{isReadOnly}
							class="group space-y-2"
						>
							<div
								class="corner-squircle flex h-8 items-center gap-1 rounded-xl border border-gray-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
							>
								<TimePicker.Input
									aria-label="Time input"
									class="flex min-w-0 flex-1 items-center gap-0.5 text-sm text-gray-900 dark:text-white"
								>
									{#snippet children(segment)}
										<TimePicker.Segment
											{segment}
											class="data-focused:data-placeholder:text-foreground data-focused:text-foreground inline rounded px-0.5 caret-transparent outline-hidden transition-all data-disabled:cursor-not-allowed data-focused:scale-115 data-focused:ring data-focused:inset-shadow-2xs data-focused:ring-white data-focused:backdrop-blur-md data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400"
										/>
									{/snippet}
								</TimePicker.Input>
								<TimePicker.Trigger
									class="corner-squircle inline-flex size-5 items-center justify-center rounded-md text-gray-500 outline-none hover:bg-gray-100 data-[focus-visible=true]:ring-1 data-[focus-visible=true]:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-600"
								>
									⏰
								</TimePicker.Trigger>
							</div>
							<TimePicker.Popover
								placement="bottom"
								class="mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
							>
								<TimePicker.TimePanel class="flex gap-2">
									{#snippet column(col)}
										<TimePicker.WheelColumn type={col.type} class="h-44 w-16 rounded-md" />
									{/snippet}
								</TimePicker.TimePanel>
							</TimePicker.Popover>
						</TimePicker.Root>
					</LocaleProvider>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoCheckbox
							label="hourCycle=12"
							checked={hourCycle === 12}
							onchange={(checked) => {
								hourCycle = checked ? 12 : 24;
							}}
						/>
						<DemoCheckbox
							label="granularity=second"
							checked={granularity === 'second'}
							onchange={(checked) => {
								granularity = checked ? 'second' : 'minute';
							}}
						/>
						<DemoCheckbox label="isDisabled" bind:checked={isDisabled} />
						<DemoCheckbox label="isReadOnly" bind:checked={isReadOnly} />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" value={playgroundValue} />
						<DemoState label="open" value={playgroundOpen} />
					</div>
				{/snippet}
			</DemoSection>

			<DemoSection title="Min/Max Range" description="Time constrained between 09:00 and 17:00">
				<div class="w-full max-w-xs">
					<TimePicker.Root
						bind:value={boundedValue}
						bind:open={boundedOpen}
						{minValue}
						{maxValue}
						class="group space-y-2"
					>
						<div
							class="corner-squircle flex h-8 items-center gap-1 rounded-xl border border-gray-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
						>
							<TimePicker.Input
								aria-label="Bounded time input"
								class="flex min-w-0 flex-1 items-center gap-0.5 text-sm text-gray-900 dark:text-white"
							>
								{#snippet children(segment)}
									<TimePicker.Segment
										{segment}
										class="data-focused:data-placeholder:text-foreground data-focused:text-foreground inline rounded px-0.5 caret-transparent outline-hidden transition-all data-disabled:cursor-not-allowed data-focused:scale-115 data-focused:ring data-focused:inset-shadow-2xs data-focused:ring-white data-focused:backdrop-blur-md data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400"
									/>
								{/snippet}
							</TimePicker.Input>
							<TimePicker.Trigger
								class="corner-squircle inline-flex size-5 items-center justify-center rounded-md text-gray-500 outline-none hover:bg-gray-100 data-[focus-visible=true]:ring-1 data-[focus-visible=true]:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-600"
							>
								⏰
							</TimePicker.Trigger>
						</div>
						<TimePicker.Popover
							placement="bottom"
							class="mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
						>
							<TimePicker.TimePanel class="flex gap-2">
								{#snippet column(col)}
									<TimePicker.WheelColumn type={col.type} class="h-44 w-16 rounded-md" />
								{/snippet}
							</TimePicker.TimePanel>
						</TimePicker.Popover>
					</TimePicker.Root>
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

			<DemoSection title="Locale en-US + 12h" description="12-hour rendering with AM/PM segment">
				<div class="w-full max-w-xs">
					<LocaleProvider locale="en-US">
						<TimePicker.Root
							bind:value={usValue}
							bind:open={usOpen}
							hourCycle={12}
							class="group space-y-2"
						>
							<div
								class="corner-squircle flex h-8 items-center gap-1 rounded-xl border border-gray-300 bg-white px-1.5 transition-colors group-data-[focus-within=true]:border-blue-500 dark:border-gray-600 dark:bg-gray-700"
							>
								<TimePicker.Input
									aria-label="US time input"
									class="flex min-w-0 flex-1 items-center gap-0.5 text-sm text-gray-900 dark:text-white"
								>
									{#snippet children(segment)}
										<TimePicker.Segment
											{segment}
											class="data-focused:data-placeholder:text-foreground data-focused:text-foreground inline rounded px-0.5 caret-transparent outline-hidden transition-all data-disabled:cursor-not-allowed data-focused:scale-115 data-focused:ring data-focused:inset-shadow-2xs data-focused:ring-white data-focused:backdrop-blur-md data-placeholder:text-neutral-400 data-[type=literal]:px-0 data-[type=literal]:text-neutral-400"
										/>
									{/snippet}
								</TimePicker.Input>
								<TimePicker.Trigger
									class="corner-squircle inline-flex size-5 items-center justify-center rounded-md text-gray-500 outline-none hover:bg-gray-100 data-[focus-visible=true]:ring-1 data-[focus-visible=true]:ring-blue-500 dark:text-gray-300 dark:hover:bg-gray-600"
								>
									⏰
								</TimePicker.Trigger>
							</div>
							<TimePicker.Popover
								placement="bottom"
								class="mt-1 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
							>
								<TimePicker.TimePanel class="flex gap-2">
									{#snippet column(col)}
										<TimePicker.WheelColumn type={col.type} class="h-44 w-16 rounded-md" />
									{/snippet}
								</TimePicker.TimePanel>
							</TimePicker.Popover>
						</TimePicker.Root>
					</LocaleProvider>
				</div>

				{#snippet controls()}
					<div class="space-y-4">
						<DemoState label="locale" value="en-US" />
						<DemoState label="hourCycle" value="12" />
						<hr class="border-gray-200 dark:border-gray-700" />
						<DemoState label="value" value={usValue} />
						<DemoState label="open" value={usOpen} />
					</div>
				{/snippet}
			</DemoSection>
		</div>
	</div>
</div>
