<script lang="ts">
	import { RadioGroup } from '../index';

	type Props = {
		showLabel?: boolean;
		showSecondLabel?: boolean;
		ariaLabelledBy?: string;
	};

	let { showLabel = true, showSecondLabel = false, ariaLabelledBy }: Props = $props();

	let showLabelOverride = $state<boolean | null>(null);

	const renderedShowLabel = $derived(showLabelOverride ?? showLabel);
</script>

<span id="outside-label" data-testid="outside-label">Outside</span>

<RadioGroup.Root aria-labelledby={ariaLabelledBy} data-testid="radio-group">
	{#if renderedShowLabel}
		<RadioGroup.Label data-testid="radio-group-label">Colors</RadioGroup.Label>
	{/if}

	{#if showSecondLabel}
		<RadioGroup.Label data-testid="radio-group-label-2">required</RadioGroup.Label>
	{/if}

	<RadioGroup.Item value="red" aria-label="Red" data-testid="radio-red">
		<RadioGroup.Indicator>x</RadioGroup.Indicator>
		<span>Red</span>
	</RadioGroup.Item>
</RadioGroup.Root>

<button type="button" data-remove-label onclick={() => (showLabelOverride = false)}>
	Remove label
</button>
