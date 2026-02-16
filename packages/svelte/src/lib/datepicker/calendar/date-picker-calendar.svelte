<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Calendar } from '../../calendar';
	import { useDatePickerContext } from '../root/context';

	type DatePickerCalendarProps = {
		class?: string;
		children?: Snippet;
	} & Record<string, unknown>;

	let { class: className = '', children, ...restProps }: DatePickerCalendarProps = $props();

	const datePicker = useDatePickerContext();

	function handleChange(nextValue: string) {
		datePicker.setValue(nextValue, 'calendar');
	}
</script>

<Calendar.Root
	selectionMode="single"
	showOutsideDays={false}
	value={datePicker.value}
	onChange={handleChange}
	isDisabled={datePicker.isDisabled}
	isReadOnly={datePicker.isReadOnly}
	isDateUnavailable={datePicker.isDateUnavailable}
	class={className}
	{...restProps}
>
	{#if children}
		{@render children()}
	{:else}
		<div class="flex items-center justify-between gap-2 p-2">
			<Calendar.TriggerPrevious
				class="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
			/>
			<Calendar.Heading class="text-sm font-medium" />
			<Calendar.TriggerNext
				class="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
			/>
		</div>
		<Calendar.Grid class="w-full border-separate border-spacing-1 px-2 pb-2">
			<Calendar.GridHeader>
				{#snippet children(dayLabel: string)}
					<Calendar.HeaderCell class="h-8 text-xs font-medium text-gray-500 dark:text-gray-400">
						{#snippet children()}{dayLabel}{/snippet}
					</Calendar.HeaderCell>
				{/snippet}
			</Calendar.GridHeader>
			<Calendar.GridBody>
				{#snippet children(date: string)}
					<Calendar.BodyCell
						{date}
						class="h-8 w-8 rounded-md text-sm text-gray-900 hover:bg-gray-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50 data-[disabled=true]:hover:bg-transparent data-[selected=true]:bg-blue-600 data-[selected=true]:text-white data-[unavailable=true]:opacity-50 dark:text-white dark:hover:bg-gray-700 dark:data-[disabled=true]:hover:bg-transparent"
					/>
				{/snippet}
			</Calendar.GridBody>
		</Calendar.Grid>
	{/if}
</Calendar.Root>
