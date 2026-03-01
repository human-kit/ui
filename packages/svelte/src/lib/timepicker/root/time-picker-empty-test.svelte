<script lang="ts">
	import TimePicker from '../index';

	let value = $state<string | null>(null);
</script>

<TimePicker.Root bind:value>
	<TimePicker.Input aria-label="Time input">
		{#snippet children(segment)}
			<TimePicker.Segment {segment} />
		{/snippet}
	</TimePicker.Input>
	<TimePicker.Trigger>Open time picker</TimePicker.Trigger>
	<TimePicker.Popover>
		<TimePicker.TimePanel />
	</TimePicker.Popover>
</TimePicker.Root>

<p data-testid="bind-value">{value}</p>
<button type="button" data-testid="outside-button">Outside</button>
