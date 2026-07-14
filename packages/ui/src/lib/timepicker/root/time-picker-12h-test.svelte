<script lang="ts">
	import { LocaleProvider } from '../../locale-provider';
	import TimePicker from '../index';

	let value = $state<string | null>('14:30');
</script>

<LocaleProvider locale="en-US">
	<TimePicker.Root bind:value hourCycle={12}>
		<TimePicker.Input aria-label="Time input">
			{#snippet children(segment)}
				<TimePicker.Segment {segment} />
			{/snippet}
		</TimePicker.Input>
		<TimePicker.Trigger>Open time picker</TimePicker.Trigger>
		<TimePicker.Popover>
			<TimePicker.Clock />
		</TimePicker.Popover>
	</TimePicker.Root>
</LocaleProvider>

<p data-testid="bind-value">{value}</p>
