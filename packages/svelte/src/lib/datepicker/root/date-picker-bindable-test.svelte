<script lang="ts">
	import DatePicker from '../index';

	let value = $state<string | null | undefined>('2026-02-10');
	let open = $state(false);
</script>

<DatePicker.Root bind:value bind:open>
	<DatePicker.Input class="date-picker-input" aria-label="Date input">
		{#snippet children(segment)}
			<DatePicker.Segment class="date-picker-segment" {segment} />
		{/snippet}
	</DatePicker.Input>
	<DatePicker.Trigger class="date-picker-trigger">Open calendar</DatePicker.Trigger>
	<DatePicker.Popover class="date-picker-popover">
		<DatePicker.Calendar class="date-picker-calendar" />
	</DatePicker.Popover>
</DatePicker.Root>

<p data-testid="bind-value">{value}</p>
<p data-testid="bind-open">{String(open)}</p>
