<script lang="ts">
	import DatePicker from '../index';

	type Props = {
		defaultValue?: string;
		initialMinValue?: string;
		nextMinValue?: string;
	};

	let {
		defaultValue = '2026-02-10',
		initialMinValue,
		nextMinValue = '2026-02-15'
	}: Props = $props();

	let minValue = $state<string | undefined>((() => initialMinValue)());
</script>

<DatePicker.Root {defaultValue} defaultOpen {minValue}>
	<DatePicker.Input class="date-picker-input" aria-label="Date input">
		{#snippet children(segment)}
			<DatePicker.Segment class="date-picker-segment" {segment} />
		{/snippet}
	</DatePicker.Input>
	<DatePicker.Trigger class="date-picker-trigger">Open calendar</DatePicker.Trigger>

	<DatePicker.Popover class="date-picker-popover" aria-label="Calendar">
		<DatePicker.Calendar class="date-picker-calendar">
			<div>
				<DatePicker.TriggerPrevious />
				<DatePicker.Heading />
				<DatePicker.TriggerNext />
			</div>
			<DatePicker.Grid>
				<DatePicker.GridHeader />
				<DatePicker.GridBody />
			</DatePicker.Grid>
		</DatePicker.Calendar>
		<!-- Inside the popover so it stays clickable while the popover is open
		     (outside content is inert). Changing minValue with the popover open
		     is exactly what the staleness test exercises. -->
		<button
			type="button"
			data-testid="set-min-value"
			onclick={() => {
				minValue = nextMinValue;
			}}
		>
			Set min value
		</button>
	</DatePicker.Popover>
</DatePicker.Root>
