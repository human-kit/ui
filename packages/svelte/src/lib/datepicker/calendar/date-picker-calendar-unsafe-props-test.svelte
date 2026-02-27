<script lang="ts">
	import DatePicker from '../index';

	let unsafeOnChangeCalls = $state(0);
	let selectedValue = $state<string | null>('');

	const unsafeCalendarProps: Record<string, unknown> = {
		selectionMode: 'range',
		value: { start: '2026-02-01', end: '2026-02-05' },
		defaultValue: '2026-02-20',
		onChange: () => {
			unsafeOnChangeCalls += 1;
		},
		isDisabled: true,
		isReadOnly: true,
		isDateUnavailable: () => true
	};
</script>

<DatePicker.Root
	defaultValue="2026-02-10"
	defaultOpen={true}
	onChange={(nextValue) => {
		selectedValue = nextValue;
	}}
>
	<DatePicker.Input class="date-picker-input" aria-label="Date input">
		{#snippet children(segment)}
			<DatePicker.Segment class="date-picker-segment" {segment} />
		{/snippet}
	</DatePicker.Input>
	<DatePicker.Trigger class="date-picker-trigger">Open calendar</DatePicker.Trigger>

	<DatePicker.Popover class="date-picker-popover">
		<DatePicker.Calendar class="date-picker-calendar" {...unsafeCalendarProps}>
			<div class="flex items-center justify-between gap-2 p-2">
				<DatePicker.CalendarTriggerPrevious />
				<DatePicker.CalendarHeading />
				<DatePicker.CalendarTriggerNext />
			</div>
			<DatePicker.CalendarGrid>
				<DatePicker.CalendarGridHeader>
					{#snippet children(dayLabel: string)}
						<DatePicker.CalendarHeaderCell>
							{#snippet children()}{dayLabel}{/snippet}
						</DatePicker.CalendarHeaderCell>
					{/snippet}
				</DatePicker.CalendarGridHeader>
				<DatePicker.CalendarGridBody>
					{#snippet children(date: string)}
						<DatePicker.CalendarBodyCell {date} />
					{/snippet}
				</DatePicker.CalendarGridBody>
			</DatePicker.CalendarGrid>
		</DatePicker.Calendar>
	</DatePicker.Popover>
</DatePicker.Root>

<p data-testid="unsafe-on-change-calls">{unsafeOnChangeCalls}</p>
<p data-testid="selected-value">{selectedValue}</p>
