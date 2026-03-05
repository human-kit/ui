<script lang="ts">
	import TimePicker from '../index';

	type Props = {
		defaultValue?: string;
		hourCycle?: 12 | 24;
		granularity?: 'hour' | 'minute' | 'second';
		isDisabled?: boolean;
		clockClass?: string;
		useSnippet?: boolean;
	};

	let {
		defaultValue = '14:30',
		hourCycle,
		granularity = 'minute',
		isDisabled = false,
		clockClass = '',
		useSnippet = false
	}: Props = $props();

	let value = $state<string | null>((() => defaultValue)());
</script>

<TimePicker.Root bind:value defaultOpen {hourCycle} {granularity} {isDisabled}>
	<TimePicker.Input aria-label="Time input">
		{#snippet children(segment)}
			<TimePicker.Segment {segment} />
		{/snippet}
	</TimePicker.Input>

	<TimePicker.Popover>
		{#if useSnippet}
			<TimePicker.Clock class={clockClass}>
				{#snippet column(col)}
					<div data-testid="custom-column" data-type={col.type}>{col.label}</div>
				{/snippet}
			</TimePicker.Clock>
		{:else}
			<TimePicker.Clock class={clockClass} />
		{/if}
	</TimePicker.Popover>
</TimePicker.Root>

<p data-testid="clock-test-value">{value}</p>
