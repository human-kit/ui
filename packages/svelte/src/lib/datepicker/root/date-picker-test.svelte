<script lang="ts">
	import DatePicker from '../index';

	type Props = {
		defaultValue?: string;
		defaultOpen?: boolean;
		isDisabled?: boolean;
		isReadOnly?: boolean;
		minValue?: string;
		maxValue?: string;
		popoverAriaLabel?: string;
	};

	let {
		defaultValue = '2026-02-10',
		defaultOpen = false,
		isDisabled = false,
		isReadOnly = false,
		minValue,
		maxValue,
		popoverAriaLabel = 'Calendar'
	}: Props = $props();

	let selectedValue = $state<string | null>('');
	let openState = $state((() => defaultOpen)());
	let openReason = $state('');
</script>

<DatePicker.Root
	{defaultValue}
	{defaultOpen}
	{isDisabled}
	{isReadOnly}
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
	<DatePicker.Input class="date-picker-input" aria-label="Date input">
		{#snippet children(segment)}
			<DatePicker.Segment class="date-picker-segment" {segment} />
		{/snippet}
	</DatePicker.Input>
	<DatePicker.Trigger class="date-picker-trigger">Open calendar</DatePicker.Trigger>

	<DatePicker.Popover class="date-picker-popover" aria-label={popoverAriaLabel}>
		<DatePicker.Calendar class="date-picker-calendar" />
	</DatePicker.Popover>
</DatePicker.Root>

<p data-testid="date-picker-value">{selectedValue}</p>
<p data-testid="date-picker-open">{String(openState)}</p>
<p data-testid="date-picker-open-reason">{openReason}</p>
<button type="button" data-testid="outside-button">Outside</button>
