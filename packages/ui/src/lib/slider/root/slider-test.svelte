<script lang="ts">
	import { Slider } from '../index';
	import type { SliderChangeDetails, SliderValue } from '../types';

	type Props = {
		value?: SliderValue;
		defaultValue?: SliderValue;
		controlledValue?: boolean;
		onChange?: (value: SliderValue, details: SliderChangeDetails) => void;
		onChangeEnd?: (value: SliderValue, details: SliderChangeDetails) => void;
		min?: number;
		max?: number;
		step?: number;
		largeStep?: number;
		minStepsBetweenThumbs?: number;
		orientation?: 'horizontal' | 'vertical';
		disabled?: boolean;
		readonly?: boolean;
		invalid?: boolean;
		name?: string;
		formatOptions?: Intl.NumberFormatOptions;
		getValueText?: (value: number, index: number) => string;
		withLabel?: boolean;
		ariaLabel?: string;
		thumbLabels?: string[];
		dir?: 'ltr' | 'rtl';
	};

	let {
		value = $bindable(),
		defaultValue,
		controlledValue = false,
		onChange,
		onChangeEnd,
		min,
		max,
		step,
		largeStep,
		minStepsBetweenThumbs,
		orientation,
		disabled = false,
		readonly = false,
		invalid = false,
		name,
		formatOptions,
		getValueText,
		withLabel = true,
		ariaLabel,
		thumbLabels,
		dir = 'ltr'
	}: Props = $props();

	const source = $derived(value ?? defaultValue);
	const thumbCount = $derived(Array.isArray(source) ? source.length : 1);
</script>

<div {dir}>
	<button data-testid="before">Before</button>
	<Slider.Root
		bind:value
		{defaultValue}
		{controlledValue}
		{onChange}
		{onChangeEnd}
		{min}
		{max}
		{step}
		{largeStep}
		{minStepsBetweenThumbs}
		{orientation}
		{disabled}
		{readonly}
		{invalid}
		{name}
		{formatOptions}
		{getValueText}
		aria-label={withLabel ? undefined : ariaLabel}
		data-testid="root"
	>
		{#if withLabel}
			<Slider.Label data-testid="label">Volume</Slider.Label>
		{/if}
		<Slider.Output data-testid="output" />
		<Slider.Track
			data-testid="track"
			style={orientation === 'vertical'
				? 'width: 8px; height: 200px;'
				: 'width: 200px; height: 8px;'}
		>
			<Slider.Fill data-testid="fill" />
			{#each { length: thumbCount } as _, i (i)}
				<Slider.Thumb
					data-testid="thumb-{i}"
					aria-label={thumbLabels?.[i]}
					style="width: 16px; height: 16px;"
				/>
			{/each}
		</Slider.Track>
	</Slider.Root>
	<button data-testid="after">After</button>
	<output data-testid="bound-value">{JSON.stringify(value)}</output>
</div>
