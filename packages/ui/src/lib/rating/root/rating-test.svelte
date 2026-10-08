<script lang="ts">
	import { Rating } from '../index';
	import type { RatingChangeDetails } from '../types';

	type Props = {
		value?: number;
		defaultValue?: number;
		controlledValue?: boolean;
		onChange?: (value: number, details: RatingChangeDetails) => void;
		onChangeEnd?: (value: number, details: RatingChangeDetails) => void;
		count?: number;
		precision?: number;
		allowClear?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		required?: boolean;
		invalid?: boolean;
		name?: string;
		getItemLabel?: (value: number, count: number) => string;
		getValueText?: (value: number, count: number) => string;
		withLabel?: boolean;
		ariaLabel?: string;
		dir?: 'ltr' | 'rtl';
	};

	let {
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		onChangeEnd,
		count = 5,
		precision,
		allowClear,
		disabled = false,
		readonly = false,
		required = false,
		invalid = false,
		name,
		getItemLabel,
		getValueText,
		withLabel = true,
		ariaLabel,
		dir = 'ltr'
	}: Props = $props();
</script>

<div {dir}>
	<button data-testid="before">Before</button>
	<Rating.Root
		bind:value
		{defaultValue}
		{controlledValue}
		{onChange}
		{onChangeEnd}
		{count}
		{precision}
		{allowClear}
		{disabled}
		{readonly}
		{required}
		{invalid}
		{name}
		{getItemLabel}
		{getValueText}
		aria-label={withLabel ? undefined : ariaLabel}
		data-testid="root"
	>
		{#if withLabel}
			<Rating.Label data-testid="label">Quality</Rating.Label>
		{/if}
		<Rating.Output data-testid="output" />
		{#each { length: count } as _, index (index)}
			<Rating.Item data-testid="item-{index}" style="width: 20px; height: 20px;" />
		{/each}
	</Rating.Root>
	<button data-testid="after">After</button>
	<output data-testid="bound-value">{JSON.stringify(value)}</output>
</div>
