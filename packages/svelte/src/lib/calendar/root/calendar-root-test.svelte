<script lang="ts">
	import Calendar from '../index';

	type Props = {
		visibleMonths?: number;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		defaultValue?: string;
		isDateUnavailable?: (date: string) => boolean;
	};

	let {
		visibleMonths = 1,
		isDisabled = false,
		isReadOnly = false,
		defaultValue,
		isDateUnavailable
	}: Props = $props();
</script>

<Calendar.Root
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
