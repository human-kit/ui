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
		<div>
			<TimePicker.WheelColumn type="hour" class="h-44" />
			<TimePicker.WheelColumn type="minute" class="h-44" />
		</div>
	</TimePicker.Popover>
</TimePicker.Root>
