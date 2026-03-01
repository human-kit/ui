<script lang="ts">
	import TimePicker from '../index';

	let value = $state<string | null>('14:30');
	let open = $state(false);
</script>

<TimePicker.Root bind:value bind:open>
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
<p data-testid="bind-open">{String(open)}</p>
