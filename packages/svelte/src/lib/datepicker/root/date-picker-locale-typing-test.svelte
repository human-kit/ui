<script lang="ts">
	import { LocaleProvider } from '../../index';
	import DatePicker from '../index';

	let selectedValue = $state<string | null>('');
</script>

<LocaleProvider locale="es-AR">
	<DatePicker.Root
		onChange={(nextValue) => {
			selectedValue = nextValue;
		}}
	>
		<DatePicker.Input class="date-picker-input" aria-label="Date input">
			{#snippet children(segment)}
				<DatePicker.Segment class="date-picker-segment" {segment} />
			{/snippet}
		</DatePicker.Input>
		<DatePicker.Trigger class="date-picker-trigger">Open calendar</DatePicker.Trigger>

		<DatePicker.Popover class="date-picker-popover">
			<DatePicker.Calendar class="date-picker-calendar" />
		</DatePicker.Popover>
	</DatePicker.Root>
</LocaleProvider>

<p data-testid="date-picker-value">{selectedValue}</p>
