<script lang="ts">
	import { PinInput } from '../index';
	import type { PinInputChangeDetails, PinInputType } from '../types';

	type Props = {
		value?: string;
		defaultValue?: string;
		controlledValue?: boolean;
		onChange?: (value: string, details: PinInputChangeDetails) => void;
		onComplete?: (value: string) => void;
		length?: number;
		type?: PinInputType;
		pattern?: RegExp;
		otp?: boolean;
		mask?: boolean;
		placeholder?: string;
		blurOnComplete?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		invalid?: boolean;
		name?: string;
		withLabel?: boolean;
		ariaLabel?: string;
		dir?: 'ltr' | 'rtl';
	};

	let {
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		onComplete,
		length = 4,
		type,
		pattern,
		otp = false,
		mask = false,
		placeholder,
		blurOnComplete = false,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		name,
		withLabel = true,
		ariaLabel,
		dir = 'ltr'
	}: Props = $props();
</script>

<div {dir}>
	<button data-testid="before">Before</button>
	<PinInput.Root
		bind:value
		{defaultValue}
		{controlledValue}
		{onChange}
		{onComplete}
		{length}
		{type}
		{pattern}
		{otp}
		{mask}
		{placeholder}
		{blurOnComplete}
		{disabled}
		{readonly}
		{required}
		{invalid}
		{name}
		aria-label={withLabel ? undefined : ariaLabel}
		data-testid="root"
	>
		{#if withLabel}
			<PinInput.Label data-testid="label">Code</PinInput.Label>
		{/if}
		{#each { length } as _, index (index)}
			<PinInput.Cell data-testid="cell-{index}" />
		{/each}
	</PinInput.Root>
	<button data-testid="after">After</button>
	<output data-testid="bound-value">{JSON.stringify(value)}</output>
</div>
