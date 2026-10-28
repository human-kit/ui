<script lang="ts">
	import DateRangePicker from '../index';
</script>

<!-- A 40px field holding both ends and a small trigger, as an app draws one. -->
<DateRangePicker.Root defaultOpen class="anchor-field">
	<DateRangePicker.Input part="start" aria-label="Start date" />
	<DateRangePicker.Input part="end" aria-label="End date" />
	<DateRangePicker.Trigger class="anchor-trigger">Open calendar</DateRangePicker.Trigger>
	<DateRangePicker.Popover>
		<DateRangePicker.Calendar>
			<DateRangePicker.Heading />
		</DateRangePicker.Calendar>
	</DateRangePicker.Popover>
</DateRangePicker.Root>

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
