<script lang="ts">
	import DatePicker from '../index';
</script>

<!-- A 40px field with a small trigger centred in it, as an app draws one. -->
<DatePicker.Root defaultValue="2026-02-10" defaultOpen class="anchor-field">
	<DatePicker.Input aria-label="Date input">
		{#snippet children(segment)}
			<DatePicker.Segment {segment} />
		{/snippet}
	</DatePicker.Input>
	<DatePicker.Trigger class="anchor-trigger">Open calendar</DatePicker.Trigger>
	<DatePicker.Popover aria-label="Calendar">
		<DatePicker.Calendar>
			<DatePicker.Heading />
		</DatePicker.Calendar>
	</DatePicker.Popover>
</DatePicker.Root>

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
