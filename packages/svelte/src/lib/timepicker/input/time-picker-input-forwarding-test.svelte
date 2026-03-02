<script lang="ts">
	import TimePicker from '../index';

	let downCount = $state(0);
	let focusCount = $state(0);
	let blurCount = $state(0);
	let keyCount = $state(0);
</script>

<TimePicker.Root defaultValue="14:30">
	<TimePicker.Input
		aria-label="Forwarding input"
		onmousedown={() => {
			downCount += 1;
		}}
		onfocus={() => {
			focusCount += 1;
		}}
		onblur={() => {
			blurCount += 1;
		}}
		onkeydown={() => {
			keyCount += 1;
		}}
	>
		{#snippet children(segment)}
			<TimePicker.Segment {segment} />
		{/snippet}
	</TimePicker.Input>
	<TimePicker.Trigger>Open time picker</TimePicker.Trigger>
	<TimePicker.Popover>
		<TimePicker.TimePanel />
	</TimePicker.Popover>
</TimePicker.Root>

<p data-testid="input-down-count">{downCount}</p>
<p data-testid="input-focus-count">{focusCount}</p>
<p data-testid="input-blur-count">{blurCount}</p>
<p data-testid="input-key-count">{keyCount}</p>
<button type="button" data-testid="outside-button">Outside</button>
