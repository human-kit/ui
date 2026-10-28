<script lang="ts">
	import TimePicker from '../index';
</script>

<!-- A 40px field with a small trigger centred in it, as an app draws one. -->
<TimePicker.Root defaultValue="09:30" defaultOpen hourCycle={24} class="anchor-field">
	<TimePicker.Input aria-label="Time input">
		{#snippet children(segment)}
			<TimePicker.Segment {segment} />
		{/snippet}
	</TimePicker.Input>
	<TimePicker.Trigger class="anchor-trigger">Open time picker</TimePicker.Trigger>
	<TimePicker.Popover>
		<TimePicker.Clock />
	</TimePicker.Popover>
</TimePicker.Root>

<style>
	:global(.anchor-field) {
		position: relative;
		height: 40px;
	}
	:global(.anchor-trigger) {
		position: absolute;
		right: 4px;
		top: 11px;
		width: 18px;
		height: 18px;
		overflow: hidden;
	}
</style>
