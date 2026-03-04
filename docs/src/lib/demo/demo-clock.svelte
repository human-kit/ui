<script lang="ts">
	import { Clock, LocaleProvider } from '@human-kit/svelte-components';
	import type { ClockGranularity, ClockHourCycle } from '@human-kit/svelte-components';
	import DemoSection from './demo-section.svelte';
	import DemoSelect from './demo-select.svelte';
	import DemoCheckbox from './demo-checkbox.svelte';
	import DemoState from './demo-state.svelte';

	// Playground
	let value = $state<string | null>('14:30');
	let locale = $state('en-US');
	let granularity = $state<ClockGranularity>('minute');
	let hourCycleStr = $state<string>('auto');
	let isDisabled = $state(false);

	const resolvedHourCycle = $derived.by<ClockHourCycle | undefined>(() => {
		if (hourCycleStr === '12') return 12;
		if (hourCycleStr === '24') return 24;
		return undefined;
	});

	const localeOptions = [
		{ value: 'en-US', label: 'English (US)' },
		{ value: 'es-ES', label: 'Español (ES)' },
		{ value: 'pt-BR', label: 'Português (BR)' },
		{ value: 'fr-FR', label: 'Français (FR)' },
		{ value: 'de-DE', label: 'Deutsch (DE)' }
	];

	const granularityOptions = [
		{ value: 'hour', label: 'Hour' },
		{ value: 'minute', label: 'Minute' },
		{ value: 'second', label: 'Second' }
	];

	const hourCycleOptions = [
		{ value: 'auto', label: 'Auto (locale)' },
		{ value: '12', label: '12-hour' },
		{ value: '24', label: '24-hour' }
	];

	// Min/Max Range
	let boundedValue = $state<string | null>('10:30');
	const minValue = '09:00';
	const maxValue = '17:00';

	// 12-hour AM/PM
	let ampmValue = $state<string | null>('14:45');

	// Seconds granularity
	let secondsValue = $state<string | null>('09:15:30');

	// Stepped
	let steppedValue = $state<string | null>('12:00');

	// Default (no snippet)
	let defaultValue = $state<string | null>('08:00');
</script>

<DemoSection title="Interactive Playground" description="Test all Clock root props interactively">
	<LocaleProvider {locale}>
		<Clock.Root
			bind:value
			{granularity}
			hourCycle={resolvedHourCycle}
			{isDisabled}
			class="flex gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			{#snippet column(col)}
				<Clock.WheelColumn type={col.type} class="h-44 w-16 rounded-md">
					{#snippet children(option)}
						<Clock.WheelItem
							type={col.type}
							{option}
							class="flex min-h-8 items-center justify-center rounded-md px-2 text-sm opacity-50 transition-opacity data-[selected=true]:bg-neutral-200 data-[selected=true]:opacity-100 data-[selected=true]:font-medium data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 dark:data-[selected=true]:bg-neutral-700"
						/>
					{/snippet}
				</Clock.WheelColumn>
			{/snippet}
		</Clock.Root>
	</LocaleProvider>

	{#snippet controls()}
		<div class="space-y-4">
			<DemoSelect label="granularity" bind:value={granularity} options={granularityOptions} />
			<DemoSelect label="hourCycle" bind:value={hourCycleStr} options={hourCycleOptions} />
			<DemoSelect label="locale" bind:value={locale} options={localeOptions} />
			<DemoCheckbox label="isDisabled" bind:checked={isDisabled} />
			<hr class="border-gray-200 dark:border-gray-700" />
			<DemoState label="value" {value} />
		</div>
	{/snippet}
</DemoSection>

<DemoSection title="Min/Max Range" description="Hours constrained between 09:00 and 17:00">
	<Clock.Root
		bind:value={boundedValue}
		{minValue}
		{maxValue}
		class="flex gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
	>
		{#snippet column(col)}
			<Clock.WheelColumn type={col.type} class="h-44 w-16 rounded-md">
				{#snippet children(option)}
					<Clock.WheelItem
						type={col.type}
						{option}
						class="flex min-h-8 items-center justify-center rounded-md px-2 text-sm opacity-50 transition-opacity data-[selected=true]:bg-neutral-200 data-[selected=true]:opacity-100 data-[selected=true]:font-medium data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 dark:data-[selected=true]:bg-neutral-700"
					/>
				{/snippet}
			</Clock.WheelColumn>
		{/snippet}
	</Clock.Root>

	{#snippet controls()}
		<div class="space-y-4">
			<DemoState label="minValue" value={minValue} />
			<DemoState label="maxValue" value={maxValue} />
			<hr class="border-gray-200 dark:border-gray-700" />
			<DemoState label="value" value={boundedValue} />
		</div>
	{/snippet}
</DemoSection>

<DemoSection title="12-hour AM/PM" description="Clock with 12-hour cycle and dayPeriod column">
	<LocaleProvider locale="en-US">
		<Clock.Root
			bind:value={ampmValue}
			hourCycle={12}
			class="flex gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			{#snippet column(col)}
				<Clock.WheelColumn type={col.type} class="h-44 w-16 rounded-md">
					{#snippet children(option)}
						<Clock.WheelItem
							type={col.type}
							{option}
							class="flex min-h-8 items-center justify-center rounded-md px-2 text-sm opacity-50 transition-opacity data-[selected=true]:bg-neutral-200 data-[selected=true]:opacity-100 data-[selected=true]:font-medium data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 dark:data-[selected=true]:bg-neutral-700"
						/>
					{/snippet}
				</Clock.WheelColumn>
			{/snippet}
		</Clock.Root>
	</LocaleProvider>

	{#snippet controls()}
		<div class="space-y-4">
			<DemoState label="hourCycle" value={12} />
			<DemoState label="locale" value="en-US" />
			<hr class="border-gray-200 dark:border-gray-700" />
			<DemoState label="value" value={ampmValue} />
		</div>
	{/snippet}
</DemoSection>

<DemoSection title="Second Granularity" description="Three columns: hour, minute, second">
	<Clock.Root
		bind:value={secondsValue}
		granularity="second"
		class="flex gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
	>
		{#snippet column(col)}
			<Clock.WheelColumn type={col.type} class="h-44 w-16 rounded-md">
				{#snippet children(option)}
					<Clock.WheelItem
						type={col.type}
						{option}
						class="flex min-h-8 items-center justify-center rounded-md px-2 text-sm opacity-50 transition-opacity data-[selected=true]:bg-neutral-200 data-[selected=true]:opacity-100 data-[selected=true]:font-medium data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 dark:data-[selected=true]:bg-neutral-700"
					/>
				{/snippet}
			</Clock.WheelColumn>
		{/snippet}
	</Clock.Root>

	{#snippet controls()}
		<div class="space-y-4">
			<DemoState label="granularity" value="second" />
			<hr class="border-gray-200 dark:border-gray-700" />
			<DemoState label="value" value={secondsValue} />
		</div>
	{/snippet}
</DemoSection>

<DemoSection title="Stepped Values" description="Minutes in increments of 15 with minuteStep">
	<Clock.Root
		bind:value={steppedValue}
		minuteStep={15}
		class="flex gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
	>
		{#snippet column(col)}
			<Clock.WheelColumn type={col.type} class="h-44 w-16 rounded-md">
				{#snippet children(option)}
					<Clock.WheelItem
						type={col.type}
						{option}
						class="flex min-h-8 items-center justify-center rounded-md px-2 text-sm opacity-50 transition-opacity data-[selected=true]:bg-neutral-200 data-[selected=true]:opacity-100 data-[selected=true]:font-medium data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-30 dark:data-[selected=true]:bg-neutral-700"
					/>
				{/snippet}
			</Clock.WheelColumn>
		{/snippet}
	</Clock.Root>

	{#snippet controls()}
		<div class="space-y-4">
			<DemoState label="minuteStep" value={15} />
			<hr class="border-gray-200 dark:border-gray-700" />
			<DemoState label="value" value={steppedValue} />
		</div>
	{/snippet}
</DemoSection>

<DemoSection
	title="Default Rendering"
	description="No column snippet — Clock.Root renders WheelColumns automatically"
>
	<Clock.Root
		bind:value={defaultValue}
		class="flex gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-xl dark:border-gray-700 dark:bg-gray-800"
	/>

	{#snippet controls()}
		<div class="space-y-4">
			<DemoState label="value" value={defaultValue} />
		</div>
	{/snippet}
</DemoSection>
