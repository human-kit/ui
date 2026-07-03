<script lang="ts">
	import DateRangePicker, { type DateRangePickerRangeValue } from '../index';

	let value = $state<DateRangePickerRangeValue | null>({
		start: '2026-02-10',
		end: '2026-02-12'
	});
	let open = $state(false);

	function formatRange(nextValue: DateRangePickerRangeValue | null): string {
		if (!nextValue) return '';
		return `${nextValue.start}/${nextValue.end}`;
	}
</script>

<DateRangePicker.Root bind:value bind:open>
	<DateRangePicker.Input part="start" aria-label="Start date" />
	<DateRangePicker.Input part="end" aria-label="End date" />
	<DateRangePicker.Trigger>Open calendar</DateRangePicker.Trigger>
	<DateRangePicker.Popover>
		<DateRangePicker.Calendar>
			<DateRangePicker.TriggerPrevious />
			<DateRangePicker.Heading />
			<DateRangePicker.TriggerNext />
			<DateRangePicker.Grid>
				<DateRangePicker.GridHeader>
					{#snippet children(dayLabel: string)}
						<DateRangePicker.HeaderCell>{dayLabel}</DateRangePicker.HeaderCell>
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

<p data-testid="bind-value">{formatRange(value)}</p>
<p data-testid="bind-open">{String(open)}</p>
