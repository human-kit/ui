<script lang="ts">
	import TimePicker from '../index';
	import { LocaleProvider } from '../../locale-provider';

	type Props = {
		locale?: string;
		defaultValue?: string;
		hourCycle?: 12 | 24;
		granularity?: 'hour' | 'minute' | 'second';
	};

	let {
		locale = 'es',
		defaultValue = '14:30',
		hourCycle = 12,
		granularity = 'minute'
	}: Props = $props();

	let selectedValue = $state<string | null>('');
</script>

<LocaleProvider {locale}>
	<TimePicker.Root
		{defaultValue}
		{hourCycle}
		{granularity}
		onChange={(nextValue) => {
			selectedValue = nextValue;
		}}
	>
		<TimePicker.Input class="time-picker-input" aria-label="Time input">
			{#snippet children(segment)}
				<TimePicker.Segment class="time-picker-segment" {segment} />
			{/snippet}
		</TimePicker.Input>
		<TimePicker.Trigger class="time-picker-trigger">Open time picker</TimePicker.Trigger>

		<TimePicker.Popover class="time-picker-popover" aria-label="Time picker">
			<TimePicker.Clock class="time-picker-columns">
				{#snippet column(col)}
					<TimePicker.WheelColumn type={col.type} class="time-picker-column h-44" />
				{/snippet}
			</TimePicker.Clock>
		</TimePicker.Popover>
	</TimePicker.Root>
</LocaleProvider>

<p data-testid="time-picker-value">{selectedValue}</p>
