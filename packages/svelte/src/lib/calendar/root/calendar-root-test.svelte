<script lang="ts">
	import Calendar from '../index';
	import type { CalendarRangeValue, CalendarSelectionMode, CalendarValue } from './context';

	type Props = {
		selectionMode?: CalendarSelectionMode;
		visibleMonths?: number;
		showOutsideDays?: boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		defaultValue?: CalendarValue;
		isDateUnavailable?: (date: string) => boolean;
	};

	let {
		selectionMode = 'single',
		visibleMonths = 1,
		showOutsideDays = false,
		isDisabled = false,
		isReadOnly = false,
		defaultValue,
		isDateUnavailable
	}: Props = $props();

	const singleDefaultValue = $derived.by(() =>
		typeof defaultValue === 'string' ? defaultValue : undefined
	);
	const rangeDefaultValue = $derived.by(() =>
		typeof defaultValue === 'string' ? undefined : (defaultValue as CalendarRangeValue | undefined)
	);
</script>

{#if selectionMode === 'range'}
	<Calendar.Root
		selectionMode="range"
		{visibleMonths}
		{showOutsideDays}
		{isDisabled}
		{isReadOnly}
		defaultValue={rangeDefaultValue}
		{isDateUnavailable}
		aria-label="Test calendar"
	>
		<Calendar.TriggerPrevious>Previous</Calendar.TriggerPrevious>
		<Calendar.Heading />
		<Calendar.TriggerNext>Next</Calendar.TriggerNext>
		<Calendar.Grid>
			<Calendar.GridHeader />
			<Calendar.GridBody />
		</Calendar.Grid>
	</Calendar.Root>
{:else}
	<Calendar.Root
		selectionMode="single"
		{visibleMonths}
		{showOutsideDays}
		{isDisabled}
		{isReadOnly}
		defaultValue={singleDefaultValue}
		{isDateUnavailable}
		aria-label="Test calendar"
	>
		<Calendar.TriggerPrevious>Previous</Calendar.TriggerPrevious>
		<Calendar.Heading />
		<Calendar.TriggerNext>Next</Calendar.TriggerNext>
		<Calendar.Grid>
			<Calendar.GridHeader />
			<Calendar.GridBody />
		</Calendar.Grid>
	</Calendar.Root>
{/if}
