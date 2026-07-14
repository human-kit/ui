<script lang="ts">
	import TimePicker from '../index';

	type Props = {
		minValue?: string;
		maxValue?: string;
		externalValue?: string;
	};

	let { minValue, maxValue, externalValue = '23:45' }: Props = $props();

	let value = $state<string | null | undefined>('14:30');
	let open = $state(false);
</script>

<TimePicker.Root bind:value bind:open hourCycle={24} {minValue} {maxValue}>
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

<p data-testid="bind-value">{value}</p>
<p data-testid="bind-open">{String(open)}</p>
<button type="button" data-testid="clear-undefined" onclick={() => (value = undefined)}
	>Clear undefined</button
>
<button type="button" data-testid="clear-null" onclick={() => (value = null)}>Clear null</button>
<button type="button" data-testid="set-external" onclick={() => (value = externalValue)}
	>Set external</button
>
