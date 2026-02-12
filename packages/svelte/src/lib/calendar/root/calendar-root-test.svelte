<script lang="ts">
	import Calendar from '../index';
	import type { CalendarSelectionMode, CalendarValue } from './context';

	type Props = {
		selectionMode?: CalendarSelectionMode;
		visibleMonths?: number;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		defaultValue?: CalendarValue;
		isDateUnavailable?: (date: string) => boolean;
	};

	let {
		selectionMode = 'single',
		visibleMonths = 1,
		isDisabled = false,
		isReadOnly = false,
		defaultValue,
		isDateUnavailable
	}: Props = $props();
</script>

<Calendar.Root
	{selectionMode}
	{visibleMonths}
	{isDisabled}
	{isReadOnly}
	{defaultValue}
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
