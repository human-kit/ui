<script lang="ts">
	import TimePicker from '../index';

	let value = $state<string | null>('14:30');
	let open = $state(true);
</script>

<TimePicker.Root bind:value bind:open>
	<TimePicker.Input aria-label="Time input">
		{#snippet children(segment)}
			<TimePicker.Segment {segment} />
		{/snippet}
	</TimePicker.Input>
	<TimePicker.Trigger>Open time picker</TimePicker.Trigger>
	<TimePicker.Popover>
		<TimePicker.TimePanel>
			{#snippet column(col)}
				<TimePicker.WheelColumn type={col.type} class="w-16" />
			{/snippet}
		</TimePicker.TimePanel>
	</TimePicker.Popover>
</TimePicker.Root>
