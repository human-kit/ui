<script lang="ts">
	import TimePicker from '../index';

	let mouseDownCount = $state(0);
	let clickCount = $state(0);
	let keyCount = $state(0);
</script>

<TimePicker.Root defaultValue="14:30">
	<TimePicker.Input aria-label="Time input">
		{#snippet children(segment)}
			<TimePicker.Segment {segment} />
		{/snippet}
	</TimePicker.Input>
	<TimePicker.Trigger
		onmousedown={() => {
			mouseDownCount += 1;
		}}
		onclick={() => {
			clickCount += 1;
		}}
		onkeydown={() => {
			keyCount += 1;
		}}
	>
		Open time picker
	</TimePicker.Trigger>
	<TimePicker.Popover>
		<TimePicker.TimePanel />
	</TimePicker.Popover>
</TimePicker.Root>

<p data-testid="trigger-mousedown-count">{mouseDownCount}</p>
<p data-testid="trigger-click-count">{clickCount}</p>
<p data-testid="trigger-key-count">{keyCount}</p>
