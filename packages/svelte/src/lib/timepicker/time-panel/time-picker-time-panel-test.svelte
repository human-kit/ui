<script lang="ts">
	import TimePicker from '../index';

	type Props = {
		defaultValue?: string;
		defaultOpen?: boolean;
		hourCycle?: 12 | 24;
		granularity?: 'hour' | 'minute' | 'second';
		useSnippet?: boolean;
	};

	let {
		defaultValue = '14:30',
		defaultOpen = true,
		hourCycle = 24,
		granularity = 'minute',
		useSnippet = false
	}: Props = $props();
</script>

<TimePicker.Root {defaultValue} {defaultOpen} {hourCycle} {granularity}>
	<TimePicker.Input aria-label="Time input">
		{#snippet children(segment)}
			<TimePicker.Segment {segment} />
		{/snippet}
	</TimePicker.Input>
	<TimePicker.Trigger>Open time picker</TimePicker.Trigger>
	<TimePicker.Popover>
		{#if useSnippet}
			<TimePicker.TimePanel>
				{#snippet column(col)}
					<div data-testid="panel-column" data-type={col.type}>{col.label}</div>
				{/snippet}
			</TimePicker.TimePanel>
		{:else}
			<TimePicker.TimePanel />
		{/if}
	</TimePicker.Popover>
</TimePicker.Root>
