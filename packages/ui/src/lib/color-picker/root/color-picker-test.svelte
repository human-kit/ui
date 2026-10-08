<script lang="ts">
	import { ColorPicker } from '../index';
	import type { ColorFormat, ColorPickerChangeDetails } from '../types';

	type Props = {
		value?: string;
		defaultValue?: string;
		controlledValue?: boolean;
		onChange?: (value: string, details: ColorPickerChangeDetails) => void;
		onChangeEnd?: (value: string, details: ColorPickerChangeDetails) => void;
		format?: ColorFormat;
		alpha?: boolean;
		disabled?: boolean;
		readonly?: boolean;
		invalid?: boolean;
		name?: string;
		withLabel?: boolean;
		ariaLabel?: string;
		swatches?: string[];
		dir?: 'ltr' | 'rtl';
	};

	let {
		value = $bindable(),
		defaultValue = '#ff0000',
		controlledValue = false,
		onChange,
		onChangeEnd,
		format,
		alpha = false,
		disabled = false,
		readonly = false,
		invalid = false,
		name,
		withLabel = true,
		ariaLabel,
		swatches = ['#ff0000', '#00ff00', '#0000ff'],
		dir = 'ltr'
	}: Props = $props();
</script>

<div {dir}>
	<button data-testid="before">Before</button>
	<ColorPicker.Root
		bind:value
		{defaultValue}
		{controlledValue}
		{onChange}
		{onChangeEnd}
		{format}
		{alpha}
		{disabled}
		{readonly}
		{invalid}
		{name}
		aria-label={withLabel ? undefined : ariaLabel}
		data-testid="root"
	>
		{#if withLabel}
			<ColorPicker.Label data-testid="label">Brand color</ColorPicker.Label>
		{/if}
		<ColorPicker.Area data-testid="area" style="width: 200px; height: 100px;">
			<ColorPicker.AreaThumb data-testid="area-thumb" style="width: 10px; height: 10px;" />
		</ColorPicker.Area>
		<ColorPicker.Slider channel="hue" data-testid="hue-slider" style="width: 180px; height: 12px;">
			<ColorPicker.SliderThumb data-testid="hue-thumb" style="width: 10px; height: 10px;" />
		</ColorPicker.Slider>
		{#if alpha}
			<ColorPicker.Slider
				channel="alpha"
				data-testid="alpha-slider"
				style="width: 180px; height: 12px;"
			>
				<ColorPicker.SliderThumb data-testid="alpha-thumb" style="width: 10px; height: 10px;" />
			</ColorPicker.Slider>
		{/if}
		<ColorPicker.HexField data-testid="hex" />
		<ColorPicker.ChannelField channel="red" data-testid="red" />
		<ColorPicker.ChannelField channel="green" data-testid="green" />
		<ColorPicker.ChannelField channel="blue" data-testid="blue" />
		<ColorPicker.Preview data-testid="preview" />
		<ColorPicker.SwatchList data-testid="swatches">
			{#each swatches as swatch, index (swatch)}
				<ColorPicker.Swatch
					color={swatch}
					data-testid="swatch-{index}"
					style="width: 16px; height: 16px;"
				/>
			{/each}
		</ColorPicker.SwatchList>
		<ColorPicker.EyeDropper data-testid="eye-dropper">Pick</ColorPicker.EyeDropper>
	</ColorPicker.Root>
	<button data-testid="after">After</button>
	<output data-testid="bound-value">{JSON.stringify(value)}</output>
</div>
