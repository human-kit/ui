<script lang="ts">
	import { CheckboxGroup } from '../index';
	import type { CheckboxGroupOrientation, CheckboxGroupValue } from '../root/context.svelte';

	type Props = {
		value?: CheckboxGroupValue[];
		defaultValue?: CheckboxGroupValue[];
		name?: string;
		orientation?: CheckboxGroupOrientation;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		redDisabled?: boolean;
		redRequired?: boolean;
		greenDisabled?: boolean;
		blueDisabled?: boolean;
		showRed?: boolean;
		showGreen?: boolean;
		showBlue?: boolean;
		onChange?: (value: CheckboxGroupValue[]) => void;
		onItemChange?: (value: string, checked: boolean) => void;
	};

	let {
		value = $bindable(),
		defaultValue,
		name,
		orientation = 'vertical',
		disabled = false,
		readonly = false,
		required = false,
		redDisabled = false,
		redRequired = false,
		greenDisabled = false,
		blueDisabled = false,
		showRed = true,
		showGreen = true,
		showBlue = true,
		onChange,
		onItemChange
	}: Props = $props();

	let showRedOverride = $state<boolean | null>(null);
	let redDisabledOverride = $state<boolean | null>(null);

	const renderedShowRed = $derived(showRedOverride ?? showRed);
	const renderedRedDisabled = $derived(redDisabledOverride ?? redDisabled);
</script>

<CheckboxGroup.Root
	bind:value
	{defaultValue}
	{name}
	{orientation}
	{disabled}
	{readonly}
	{required}
	{onChange}
	aria-label="Colors"
	data-testid="checkbox-group"
>
	{#if renderedShowRed}
		<CheckboxGroup.Item
			value="red"
			disabled={renderedRedDisabled}
			required={redRequired}
			aria-label="Red"
			onCheckedChange={(checked) => onItemChange?.('red', checked)}
			data-testid="checkbox-red"
		>
			<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
			<span>Red</span>
		</CheckboxGroup.Item>
	{/if}

	{#if showGreen}
		<CheckboxGroup.Item
			value="green"
			disabled={greenDisabled}
			aria-label="Green"
			onCheckedChange={(checked) => onItemChange?.('green', checked)}
			data-testid="checkbox-green"
		>
			<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
			<span>Green</span>
		</CheckboxGroup.Item>
	{/if}

	{#if showBlue}
		<CheckboxGroup.Item
			value="blue"
			disabled={blueDisabled}
			aria-label="Blue"
			onCheckedChange={(checked) => onItemChange?.('blue', checked)}
			data-testid="checkbox-blue"
		>
			<CheckboxGroup.Indicator>x</CheckboxGroup.Indicator>
			<span>Blue</span>
		</CheckboxGroup.Item>
	{/if}
</CheckboxGroup.Root>

<button type="button" data-set-green onclick={() => (value = ['green'])}>Set green</button>
<button type="button" data-clear-value onclick={() => (value = [])}>Clear value</button>
<button type="button" data-disable-red onclick={() => (redDisabledOverride = true)}>
	Disable red
</button>
<button type="button" data-remove-red onclick={() => (showRedOverride = false)}>Remove red</button>
<output data-current-value>{JSON.stringify(value ?? [])}</output>
