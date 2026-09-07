<script lang="ts">
	import { RadioGroup } from '../index';
	import type { RadioGroupOrientation, RadioGroupValue } from '../root/context.svelte';

	type Props = {
		value?: RadioGroupValue | null;
		defaultValue?: RadioGroupValue | null;
		name?: string;
		orientation?: RadioGroupOrientation;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		smallDisabled?: boolean;
		mediumDisabled?: boolean;
		largeDisabled?: boolean;
		showSmall?: boolean;
		onChange?: (value: RadioGroupValue) => void;
	};

	let {
		value = $bindable(),
		defaultValue,
		name,
		orientation = 'vertical',
		disabled = false,
		readonly = false,
		required = false,
		smallDisabled = false,
		mediumDisabled = false,
		largeDisabled = false,
		showSmall = true,
		onChange
	}: Props = $props();

	let showSmallOverride = $state<boolean | null>(null);
	let mediumDisabledOverride = $state<boolean | null>(null);

	const renderedShowSmall = $derived(showSmallOverride ?? showSmall);
	const renderedMediumDisabled = $derived(mediumDisabledOverride ?? mediumDisabled);
</script>

<button type="button" data-before>Before</button>

<RadioGroup.Root
	bind:value
	{defaultValue}
	{name}
	{orientation}
	{disabled}
	{readonly}
	{required}
	{onChange}
	aria-label="Size"
	data-testid="radio-group"
>
	{#if renderedShowSmall}
		<RadioGroup.Item
			value="small"
			disabled={smallDisabled}
			aria-label="Small"
			data-testid="radio-small"
		>
			<RadioGroup.Indicator>x</RadioGroup.Indicator>
			<span>Small</span>
		</RadioGroup.Item>
	{/if}

	<RadioGroup.Item
		value="medium"
		disabled={renderedMediumDisabled}
		aria-label="Medium"
		data-testid="radio-medium"
	>
		<RadioGroup.Indicator>x</RadioGroup.Indicator>
		<span>Medium</span>
	</RadioGroup.Item>

	<RadioGroup.Item
		value="large"
		disabled={largeDisabled}
		aria-label="Large"
		data-testid="radio-large"
	>
		<RadioGroup.Indicator>x</RadioGroup.Indicator>
		<span>Large</span>
	</RadioGroup.Item>
</RadioGroup.Root>

<button type="button" data-set-large onclick={() => (value = 'large')}>Set large</button>
<button type="button" data-disable-medium onclick={() => (mediumDisabledOverride = true)}>
	Disable medium
</button>
<button type="button" data-remove-small onclick={() => (showSmallOverride = false)}>
	Remove small
</button>
<output data-current-value>{value ?? 'null'}</output>
