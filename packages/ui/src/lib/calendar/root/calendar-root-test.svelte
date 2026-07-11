<script lang="ts">
	import Calendar from '../index';
	import { LocaleProvider } from '../../locale-provider';
	import type { CalendarRangeValue, CalendarSelectionMode, CalendarValue } from './context.svelte';
	import type {
		CalendarFirstDayOfWeek,
		CalendarMonthHeadingStyle,
		CalendarWeekdayStyle
	} from './date-utils';

	type Props = {
		selectionMode?: CalendarSelectionMode;
		visibleMonths?: number;
		showOutsideDays?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		defaultValue?: CalendarValue;
		minValue?: string;
		maxValue?: string;
		isDateUnavailable?: (date: string) => boolean;
		locale?: string;
		firstDayOfWeek?: CalendarFirstDayOfWeek;
		monthHeadingStyle?: CalendarMonthHeadingStyle;
		weekdayStyle?: CalendarWeekdayStyle;
	};

	let {
		selectionMode = 'single',
		visibleMonths = 1,
		showOutsideDays = false,
		disabled = false,
		readonly = false,
		defaultValue,
		minValue,
		maxValue,
		isDateUnavailable,
		locale,
		firstDayOfWeek,
		monthHeadingStyle = 'composed',
		weekdayStyle = 'short'
	}: Props = $props();

	const singleDefaultValue = $derived.by(() =>
		typeof defaultValue === 'string' ? defaultValue : undefined
	);
	const rangeDefaultValue = $derived.by(() =>
		typeof defaultValue === 'string' ? undefined : (defaultValue as CalendarRangeValue | undefined)
	);
</script>

<LocaleProvider {locale}>
	{#if selectionMode === 'range'}
		<Calendar.Root
			selectionMode="range"
			{visibleMonths}
			{showOutsideDays}
			{firstDayOfWeek}
			{monthHeadingStyle}
			{disabled}
			{readonly}
			{minValue}
			{maxValue}
			defaultValue={rangeDefaultValue}
			{isDateUnavailable}
			aria-label="Test calendar"
		>
			<Calendar.TriggerPrevious>Previous</Calendar.TriggerPrevious>
			<Calendar.Heading />
			<Calendar.TriggerNext>Next</Calendar.TriggerNext>
			<Calendar.Grid {weekdayStyle}>
				<Calendar.GridHeader />
				<Calendar.GridBody />
			</Calendar.Grid>
		</Calendar.Root>
	{:else}
		<Calendar.Root
			selectionMode="single"
			{visibleMonths}
			{showOutsideDays}
			{firstDayOfWeek}
			{monthHeadingStyle}
			{disabled}
			{readonly}
			{minValue}
			{maxValue}
			defaultValue={singleDefaultValue}
			{isDateUnavailable}
			aria-label="Test calendar"
		>
			<Calendar.TriggerPrevious>Previous</Calendar.TriggerPrevious>
			<Calendar.Heading />
			<Calendar.TriggerNext>Next</Calendar.TriggerNext>
			<Calendar.Grid {weekdayStyle}>
				<Calendar.GridHeader />
				<Calendar.GridBody />
			</Calendar.Grid>
		</Calendar.Root>
	{/if}
</LocaleProvider>
