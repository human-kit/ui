<script lang="ts">
	import { LocaleProvider } from '../../locale-provider';
	import TimePicker from '../index';

	let value = $state<string | null>('14:30');
	let hourCycle = $state<12 | 24>(12);
</script>

<LocaleProvider locale="en-US">
	<TimePicker.Root bind:value {hourCycle}>
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
<button type="button" data-testid="set-24h" onclick={() => (hourCycle = 24)}>Use 24h</button>
<button type="button" data-testid="set-12h" onclick={() => (hourCycle = 12)}>Use 12h</button>
