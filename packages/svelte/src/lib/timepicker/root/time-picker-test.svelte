<script lang="ts">
	import TimePicker from '../index';

	type Props = {
		defaultValue?: string;
		defaultOpen?: boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		hourCycle?: 12 | 24;
		granularity?: 'hour' | 'minute' | 'second';
		minValue?: string;
		maxValue?: string;
		popoverAriaLabel?: string;
		shouldCloseOnSelect?: boolean;
		closeOnSelect?: boolean;
	};

	let {
		defaultValue = '14:30',
		defaultOpen = false,
		isDisabled = false,
		isReadOnly = false,
		hourCycle,
		granularity = 'minute',
		minValue,
		maxValue,
		popoverAriaLabel = 'Time picker',
		shouldCloseOnSelect,
		closeOnSelect
	}: Props = $props();

	let selectedValue = $state<string | null>('');
	let openState = $state((() => defaultOpen)());
	let openReason = $state('');
</script>

<TimePicker.Root
	{defaultValue}
	{defaultOpen}
	{isDisabled}
	{isReadOnly}
	{hourCycle}
	{granularity}
	{minValue}
	{maxValue}
	{shouldCloseOnSelect}
	{closeOnSelect}
	onChange={(nextValue) => {
		selectedValue = nextValue;
	}}
	onOpenChange={(nextOpen, details) => {
		openState = nextOpen;
		openReason = details.reason;
	}}
>
	<TimePicker.Input class="time-picker-input" aria-label="Time input">
		{#snippet children(segment)}
			<TimePicker.Segment class="time-picker-segment" {segment} />
		{/snippet}
	</TimePicker.Input>
	<TimePicker.Trigger class="time-picker-trigger">Open time picker</TimePicker.Trigger>

	<TimePicker.Popover class="time-picker-popover" aria-label={popoverAriaLabel}>
		<TimePicker.TimePanel class="time-picker-columns">
			{#snippet column(col)}
				<TimePicker.Column type={col.type} class="time-picker-column" />
			{/snippet}
		</TimePicker.TimePanel>
	</TimePicker.Popover>
</TimePicker.Root>

<p data-testid="time-picker-value">{selectedValue}</p>
<p data-testid="time-picker-open">{String(openState)}</p>
<p data-testid="time-picker-open-reason">{openReason}</p>
<button type="button" data-testid="outside-button">Outside</button>
