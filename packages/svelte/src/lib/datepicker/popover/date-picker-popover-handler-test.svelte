<script lang="ts">
	import DatePicker from '../index';

	let pointerDownCalls = $state(0);
	let keydownCaptureCalls = $state(0);
	let selectedValue = $state<string | null>('');
</script>

<DatePicker.Root
	defaultValue="2026-02-10"
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

	<DatePicker.Popover
		class="date-picker-popover"
		onmousedown={() => {
			pointerDownCalls += 1;
		}}
		onkeydowncapture={() => {
			keydownCaptureCalls += 1;
		}}
	>
		<DatePicker.Calendar class="date-picker-calendar">
			<div class="flex items-center justify-between gap-2 p-2">
				<DatePicker.TriggerPrevious />
				<DatePicker.Heading />
				<DatePicker.TriggerNext />
			</div>
			<DatePicker.Grid>
				<DatePicker.GridHeader>
					{#snippet children(dayLabel: string)}
						<DatePicker.HeaderCell>
							{dayLabel}
						</DatePicker.HeaderCell>
					{/snippet}
				</DatePicker.GridHeader>
				<DatePicker.GridBody>
					{#snippet children(date: string)}
						<DatePicker.BodyCell {date} />
					{/snippet}
				</DatePicker.GridBody>
			</DatePicker.Grid>
		</DatePicker.Calendar>
	</DatePicker.Popover>
</DatePicker.Root>

<p data-testid="pointer-down-calls">{pointerDownCalls}</p>
<p data-testid="keydown-capture-calls">{keydownCaptureCalls}</p>
<p data-testid="selected-value">{selectedValue}</p>
