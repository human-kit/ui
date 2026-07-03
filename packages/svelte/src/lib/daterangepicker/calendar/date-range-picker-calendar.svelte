<script lang="ts">
	import type { ComponentProps, Snippet } from 'svelte';
	import { Calendar } from '../../calendar';
	import { sanitizeDateRangePickerProps } from '../internal/strict-props';
	import { useDateRangePickerContext } from '../root/context';
	import type { CalendarRangeValue } from '../../calendar/root/context';

	type ForbiddenCalendarProp =
		| 'selectionMode'
		| 'value'
		| 'defaultValue'
		| 'onChange'
		| 'disabled'
		| 'readonly'
		| 'isDateUnavailable';

	type DateRangePickerCalendarProps = Omit<
		ComponentProps<typeof Calendar.Root>,
		ForbiddenCalendarProp
	> & {
		class?: string;
		children?: Snippet;
	};

	const forbiddenCalendarProps: ForbiddenCalendarProp[] = [
		'selectionMode',
		'value',
		'defaultValue',
		'onChange',
		'disabled',
		'readonly',
		'isDateUnavailable'
	];

	let {
		class: className = '',
		children,
		...unsafeRestProps
	}: DateRangePickerCalendarProps = $props();

	const dateRangePicker = useDateRangePickerContext();
	const restProps = $derived.by(
		() =>
			sanitizeDateRangePickerProps(
				'Calendar',
				unsafeRestProps as Record<string, unknown>,
				forbiddenCalendarProps
			) as Omit<ComponentProps<typeof Calendar.Root>, ForbiddenCalendarProp>
	);
	const calendarValue = $derived<CalendarRangeValue | undefined>(
		dateRangePicker.value
			? { start: dateRangePicker.value.start, end: dateRangePicker.value.end }
			: undefined
	);

	function handleChange(nextValue: CalendarRangeValue) {
		if (!nextValue.start || !nextValue.end) return;
		dateRangePicker.setValue({ start: nextValue.start, end: nextValue.end }, 'calendar');
	}
</script>

<Calendar.Root
	selectionMode="range"
	showOutsideDays={false}
	value={calendarValue}
	onChange={handleChange}
	disabled={dateRangePicker.isDisabled}
	readonly={dateRangePicker.isReadOnly}
	isDateUnavailable={dateRangePicker.isDateUnavailable}
	class={className}
	{...restProps}
>
	{#if children}
		{@render children()}
	{/if}
</Calendar.Root>
