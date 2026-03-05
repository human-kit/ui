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
		<TimePicker.Clock class="flex">
			{#snippet column(col)}
				<TimePicker.WheelColumn type={col.type} class="h-44" />
			{/snippet}
		</TimePicker.Clock>
	</TimePicker.Popover>
</TimePicker.Root>
