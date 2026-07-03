<script lang="ts">
	import { Calendar, LocaleProvider } from '@human-kit/ui';
	import type { CalendarSelectionMode } from '@human-kit/ui';
	import DemoSection from './demo-section.svelte';
	import DemoInput from './demo-input.svelte';
	import DemoSelect from './demo-select.svelte';
	import DemoCheckbox from './demo-checkbox.svelte';
	import DemoState from './demo-state.svelte';

	type CalendarDemoRange = { start?: string; end?: string };
	type CalendarDemoValue = string | CalendarDemoRange;

	let visibleMonths = $state(1);
	let locale = $state('en-US');
	let selectionMode = $state<CalendarSelectionMode>('single');
	let isDisabled = $state(false);
	let isReadOnly = $state(false);
	let singleValue = $state('');
	let rangeValue = $state<CalendarDemoRange>({});
	const value = $derived.by<CalendarDemoValue>(() =>
		selectionMode === 'single' ? singleValue : rangeValue
	);

	const localeOptions = [
		{ value: 'en-US', label: 'English (US)' },
		{ value: 'es-ES', label: 'Español (ES)' },
		{ value: 'pt-BR', label: 'Português (BR)' },
		{ value: 'fr-FR', label: 'Français (FR)' },
		{ value: 'de-DE', label: 'Deutsch (DE)' }
	];

	const selectionModeOptions = [
		{ value: 'single', label: 'Single' },
		{ value: 'range', label: 'Range' }
	];

	function isWeekend(date: string) {
		const parsed = new Date(`${date}T00:00:00Z`);
		const day = parsed.getUTCDay();
		return day === 0 || day === 6;
	}
</script>

<DemoSection
	title="Interactive Playground"
	description="Test all Calendar root props interactively"
>
	<LocaleProvider {locale}>
		{#if selectionMode === 'single'}
			<Calendar.Root
				bind:value={singleValue}
				selectionMode="single"
				{visibleMonths}
				disabled={isDisabled}
				readonly={isReadOnly}
				isDateUnavailable={isWeekend}
				class="space-y-4"
			>
				<div class="flex items-center gap-3">
					<Calendar.TriggerPrevious
						class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
					>
						Previous
					</Calendar.TriggerPrevious>
					<Calendar.Heading class="text-lg font-semibold text-gray-900 dark:text-white" />
					<Calendar.TriggerNext
						class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
					>
						Next
					</Calendar.TriggerNext>
				</div>

				<Calendar.Grid class="flex gap-4 text-gray-900 dark:text-gray-100">
					<Calendar.GridHeader>
						{#snippet children(day)}
							<Calendar.HeaderCell
								class="px-2 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300"
							>
								{day}
							</Calendar.HeaderCell>
						{/snippet}
					</Calendar.GridHeader>
					<Calendar.GridBody>
						{#snippet children(date)}
							<Calendar.BodyCell
								{date}
								class="p-1 text-center text-gray-900 data-disabled:text-red-600 data-in-range:bg-blue-100 data-outside-month:opacity-45 data-range-end:rounded-r data-range-start:rounded-l data-selected:rounded data-selected:bg-blue-600 data-selected:text-white dark:text-gray-100 dark:data-disabled:text-red-400 dark:data-in-range:bg-blue-900/40"
							/>
						{/snippet}
					</Calendar.GridBody>
				</Calendar.Grid>
			</Calendar.Root>
		{:else}
			<Calendar.Root
				bind:value={rangeValue}
				selectionMode="range"
				{visibleMonths}
				disabled={isDisabled}
				readonly={isReadOnly}
				isDateUnavailable={isWeekend}
				class="space-y-4"
			>
				<div class="flex items-center gap-3">
					<Calendar.TriggerPrevious
						class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
					>
						Previous
					</Calendar.TriggerPrevious>
					<Calendar.Heading class="text-lg font-semibold text-gray-900 dark:text-white" />
					<Calendar.TriggerNext
						class="rounded border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
					>
						Next
					</Calendar.TriggerNext>
				</div>

				<Calendar.Grid class="flex gap-4 text-gray-900 dark:text-gray-100">
					<Calendar.GridHeader>
						{#snippet children(day)}
							<Calendar.HeaderCell
								class="px-2 py-1 text-center text-xs font-medium text-gray-600 dark:text-gray-300"
							>
								{day}
							</Calendar.HeaderCell>
						{/snippet}
					</Calendar.GridHeader>
					<Calendar.GridBody>
						{#snippet children(date)}
							<Calendar.BodyCell
								{date}
								class="p-1 text-center text-gray-900 data-disabled:text-red-600 data-in-range:bg-blue-100 data-outside-month:opacity-45 data-range-end:rounded-r data-range-start:rounded-l data-selected:rounded data-selected:bg-blue-600 data-selected:text-white dark:text-gray-100 dark:data-disabled:text-red-400 dark:data-in-range:bg-blue-900/40"
							/>
						{/snippet}
					</Calendar.GridBody>
				</Calendar.Grid>
			</Calendar.Root>
		{/if}
	</LocaleProvider>

	{#snippet controls()}
		<div class="space-y-4">
			<DemoSelect label="selectionMode" bind:value={selectionMode} options={selectionModeOptions} />
			<DemoSelect label="locale" bind:value={locale} options={localeOptions} />
			<DemoInput label="visibleMonths" type="number" bind:value={visibleMonths} />
			<DemoCheckbox label="disabled" bind:checked={isDisabled} />
			<DemoCheckbox label="readonly" bind:checked={isReadOnly} />
			<hr class="border-gray-200 dark:border-gray-700" />
			<DemoState label="selectionMode" value={selectionMode} />
			<DemoState label="value" {value} />
		</div>
	{/snippet}
</DemoSection>
