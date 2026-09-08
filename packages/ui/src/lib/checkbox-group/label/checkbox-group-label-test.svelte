<script lang="ts">
	import { CheckboxGroup } from '../index';

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

<CheckboxGroup.Root aria-labelledby={ariaLabelledBy} data-testid="checkbox-group">
	{#if renderedShowLabel}
		<CheckboxGroup.Label data-testid="checkbox-group-label">Colors</CheckboxGroup.Label>
	{/if}

	{#if showSecondLabel}
		<CheckboxGroup.Label data-testid="checkbox-group-label-2">required</CheckboxGroup.Label>
	{/if}

	<CheckboxGroup.Item value="red" aria-label="Red" data-testid="checkbox-red">
		<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
		<span>Red</span>
	</CheckboxGroup.Item>
</CheckboxGroup.Root>

<button type="button" data-remove-label onclick={() => (showLabelOverride = false)}>
	Remove label
</button>
