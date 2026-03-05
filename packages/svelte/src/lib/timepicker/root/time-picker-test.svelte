<script lang="ts">
	import TimePicker from '../index';

	type Props = {
		defaultValue?: string;
		defaultOpen?: boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		hourCycle?: 12 | 24;
		granularity?: 'hour' | 'minute' | 'second';
		isRequired?: boolean;
		minValue?: string;
		maxValue?: string;
		popoverAriaLabel?: string;
	};

	let {
		defaultValue = '14:30',
		defaultOpen = false,
		isDisabled = false,
		isReadOnly = false,
		hourCycle = 24,
		granularity = 'minute',
		isRequired = false,
		minValue,
		maxValue,
		popoverAriaLabel = 'Time picker'
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
	{isRequired}
	{minValue}
	{maxValue}
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
		<TimePicker.Clock class="time-picker-columns">
			{#snippet column(col)}
				<TimePicker.WheelColumn type={col.type} class="time-picker-column h-44" />
			{/snippet}
		</TimePicker.Clock>
	</TimePicker.Popover>
</TimePicker.Root>

<p data-testid="time-picker-value">{selectedValue}</p>
<p data-testid="time-picker-open">{String(openState)}</p>
<p data-testid="time-picker-open-reason">{openReason}</p>
<button type="button" data-testid="outside-button">Outside</button>
