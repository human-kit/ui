<script lang="ts">
	import { untrack } from 'svelte';
	import DateRangePicker, { type DateRangePickerRangeValue } from '../index';

	type Props = {
		defaultValue?: DateRangePickerRangeValue | null;
		defaultOpen?: boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		minValue?: string;
		maxValue?: string;
		isDateUnavailable?: (date: string) => boolean;
		startInputId?: string;
		startInputName?: string;
		endInputId?: string;
		endInputName?: string;
	};

	let {
		defaultValue = { start: '2026-02-10', end: '2026-02-12' },
		defaultOpen = false,
		isDisabled = false,
		isReadOnly = false,
		minValue,
		maxValue,
		isDateUnavailable,
		startInputId,
		startInputName,
		endInputId,
		endInputName
	}: Props = $props();

	function formatRange(value: DateRangePickerRangeValue | null): string {
		if (!value) return '';
		return `${value.start}/${value.end}`;
	}

	let selectedValue = $state(untrack(() => formatRange(defaultValue)));
	let openState = $state((() => defaultOpen)());
	let openReason = $state('');
</script>

<DateRangePicker.Root
	{defaultValue}
	{defaultOpen}
	{isDisabled}
	{isReadOnly}
	{minValue}
	{maxValue}
	{isDateUnavailable}
	onChange={(nextValue) => {
		selectedValue = formatRange(nextValue);
	}}
	onOpenChange={(nextOpen, details) => {
		openState = nextOpen;
		openReason = details.reason;
	}}
>
	<DateRangePicker.Input
		part="start"
		id={startInputId}
		name={startInputName}
		class="date-range-picker-input"
		aria-label="Start date"
	>
		{#snippet children(segment)}
			<DateRangePicker.Segment part="start" class="date-range-picker-segment" {segment} />
		{/snippet}
	</DateRangePicker.Input>

	<DateRangePicker.Input
		part="end"
		id={endInputId}
		name={endInputName}
		class="date-range-picker-input"
		aria-label="End date"
	>
		{#snippet children(segment)}
			<DateRangePicker.Segment part="end" class="date-range-picker-segment" {segment} />
		{/snippet}
	</DateRangePicker.Input>

	<DateRangePicker.Trigger class="date-range-picker-trigger">Open calendar</DateRangePicker.Trigger>

	<DateRangePicker.Popover class="date-range-picker-popover" aria-label="Calendar">
		<DateRangePicker.Calendar class="date-range-picker-calendar">
			<div class="flex items-center justify-between gap-2 p-2">
				<DateRangePicker.TriggerPrevious />
				<DateRangePicker.Heading />
				<DateRangePicker.TriggerNext />
			</div>
			<DateRangePicker.Grid>
				<DateRangePicker.GridHeader>
					{#snippet children(dayLabel: string)}
						<DateRangePicker.HeaderCell>
							{dayLabel}
						</DateRangePicker.HeaderCell>
					{/snippet}
				</DateRangePicker.GridHeader>
				<DateRangePicker.GridBody>
					{#snippet children(date: string)}
						<DateRangePicker.BodyCell {date} />
					{/snippet}
				</DateRangePicker.GridBody>
			</DateRangePicker.Grid>
		</DateRangePicker.Calendar>
	</DateRangePicker.Popover>
</DateRangePicker.Root>

<p data-testid="date-range-picker-value">{selectedValue}</p>
<p data-testid="date-range-picker-open">{String(openState)}</p>
<p data-testid="date-range-picker-open-reason">{openReason}</p>
<button type="button" data-testid="outside-button">Outside</button>
