<script lang="ts">
	import DatePicker from '../index';

	let value = $state<string | null | undefined>(undefined);
</script>

<DatePicker.Root bind:value>
	<DatePicker.Input class="date-picker-input" aria-label="Date input">
		{#snippet children(segment)}
			<DatePicker.Segment class="date-picker-segment" {segment} />
		{/snippet}
	</DatePicker.Input>
</DatePicker.Root>

<p data-testid="bind-value-state">
	{value === undefined ? 'undefined' : value === null ? 'null' : value}
</p>
