<script lang="ts">
	import TimePicker from '../index';

	type Props = {
		defaultValue?: string;
		defaultOpen?: boolean;
	};

	let { defaultValue = '14:30', defaultOpen = true }: Props = $props();

	let selectedValue = $state<string | null>('');
</script>

<TimePicker.Root
	{defaultValue}
	{defaultOpen}
	onChange={(nextValue) => {
		selectedValue = nextValue;
	}}
>
	<TimePicker.Input aria-label="Time input">
		{#snippet children(segment)}
			<TimePicker.Segment {segment} />
		{/snippet}
	</TimePicker.Input>
	<TimePicker.Trigger>Open</TimePicker.Trigger>
	<TimePicker.Popover>
		<TimePicker.TimePanel>
			{#snippet column(col)}
				<TimePicker.WheelColumn type={col.type} class="h-44 w-16">
					{#snippet children(option)}
						<TimePicker.WheelItem type={col.type} {option} class="custom-wheel-item" />
					{/snippet}
				</TimePicker.WheelColumn>
			{/snippet}
		</TimePicker.TimePanel>
	</TimePicker.Popover>
</TimePicker.Root>

<p data-testid="time-picker-value">{selectedValue}</p>
