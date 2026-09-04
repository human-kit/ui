<script lang="ts">
	import TimePicker from '../index';

	type Props = {
		defaultValue?: string;
		defaultOpen?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		hourCycle?: 12 | 24;
		granularity?: 'hour' | 'minute' | 'second';
		required?: boolean;
		minValue?: string;
		maxValue?: string;
		popoverAriaLabel?: string;
		rootAriaLabel?: string;
		inputId?: string;
		inputName?: string;
		inputLabel?: string;
		inputAriaInvalid?: boolean;
	};

	let {
		defaultValue = '14:30',
		defaultOpen = false,
		disabled = false,
		readonly = false,
		hourCycle = 24,
		granularity = 'minute',
		required = false,
		minValue,
		maxValue,
		popoverAriaLabel = 'Time picker',
		rootAriaLabel,
		inputId,
		inputName,
		inputLabel,
		inputAriaInvalid
	}: Props = $props();

	let selectedValue = $state<string | null>('');
	let openState = $state((() => defaultOpen)());
	let openReason = $state('');
</script>

<TimePicker.Root
	{defaultValue}
	{defaultOpen}
	{disabled}
	{readonly}
	{hourCycle}
	{granularity}
	{required}
	{minValue}
	{maxValue}
	aria-label={rootAriaLabel}
	onChange={(nextValue) => {
		selectedValue = nextValue;
	}}
	onOpenChange={(nextOpen, details) => {
		openState = nextOpen;
		openReason = details.reason;
	}}
>
	{#if inputLabel && inputId}
		<label for={inputId}>{inputLabel}</label>
	{/if}

	<TimePicker.Input
		id={inputId}
		name={inputName}
		aria-invalid={inputAriaInvalid}
		class="time-picker-input"
		aria-label="Time input"
	>
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
