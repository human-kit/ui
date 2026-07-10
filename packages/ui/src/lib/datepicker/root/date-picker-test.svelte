<script lang="ts">
	import DatePicker from '../index';

	type Props = {
		defaultValue?: string;
		defaultOpen?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		minValue?: string;
		maxValue?: string;
		isDateUnavailable?: (date: string) => boolean;
		inputId?: string;
		inputName?: string;
		inputLabel?: string;
		inputAriaInvalid?: boolean;
		popoverAriaLabel?: string;
	};

	let {
		defaultValue = '2026-02-10',
		defaultOpen = false,
		disabled = false,
		readonly = false,
		minValue,
		maxValue,
		isDateUnavailable,
		inputId,
		inputName,
		inputLabel,
		inputAriaInvalid,
		popoverAriaLabel = 'Calendar'
	}: Props = $props();

	let selectedValue = $state<string | null>('');
	let openState = $state((() => defaultOpen)());
	let openReason = $state('');
	let blurCount = $state(0);
</script>

<DatePicker.Root
	{defaultValue}
	{defaultOpen}
	{disabled}
	{readonly}
	{minValue}
	{maxValue}
	{isDateUnavailable}
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

	<DatePicker.Input
		id={inputId}
		name={inputName}
		class="date-picker-input"
		aria-label="Date input"
		aria-invalid={inputAriaInvalid}
		onblur={() => {
			blurCount += 1;
		}}
	>
		{#snippet children(segment)}
			<DatePicker.Segment class="date-picker-segment" {segment} />
		{/snippet}
	</DatePicker.Input>
	<DatePicker.Trigger class="date-picker-trigger">Open calendar</DatePicker.Trigger>

	<DatePicker.Popover class="date-picker-popover" aria-label={popoverAriaLabel}>
		<DatePicker.Calendar class="date-picker-calendar">
			<div class="flex items-center justify-between gap-2 p-2">
				<DatePicker.TriggerPrevious
					class="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
				/>
				<DatePicker.Heading class="text-sm font-medium" />
				<DatePicker.TriggerNext
					class="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-700"
				/>
			</div>
			<DatePicker.Grid class="w-full border-separate border-spacing-1 px-2 pb-2">
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

<p data-testid="date-picker-value">{selectedValue}</p>
<p data-testid="date-picker-open">{String(openState)}</p>
<p data-testid="date-picker-open-reason">{openReason}</p>
<p data-testid="date-picker-blur-count">{blurCount}</p>
<button type="button" data-testid="outside-button">Outside</button>
