<script lang="ts">
	import * as Clock from '../index.parts';

	type Props = {
		defaultValue?: string;
	};

	let { defaultValue = '14:30' }: Props = $props();

	let selectedValue = $state<string | null>('');
</script>

<Clock.Root
	{defaultValue}
	onChange={(nextValue) => {
		selectedValue = nextValue;
	}}
	class="flex gap-2"
>
	{#snippet column(col)}
		<Clock.WheelColumn type={col.type} class="h-44 w-16">
			{#snippet children(option)}
				<div data-testid="untagged-wheel-option">{option.label}</div>
			{/snippet}
		</Clock.WheelColumn>
	{/snippet}
</Clock.Root>

<p data-testid="clock-value">{selectedValue}</p>
