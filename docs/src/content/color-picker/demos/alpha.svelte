<script lang="ts">
	import { ColorPicker } from '@human-kit/ui';

	let value = $state('rgba(51, 102, 204, 0.75)');

	const checkers =
		'background-image: linear-gradient(45deg, #ccc 25%, transparent 25%),' +
		' linear-gradient(-45deg, #ccc 25%, transparent 25%),' +
		' linear-gradient(45deg, transparent 75%, #ccc 75%),' +
		' linear-gradient(-45deg, transparent 75%, #ccc 75%);' +
		' background-size: 10px 10px;' +
		' background-position: 0 0, 0 5px, 5px -5px, -5px 0;';
</script>

<ColorPicker.Root bind:value format="rgb" alpha class="flex w-64 flex-col gap-3">
	<ColorPicker.Label class="text-sm font-medium text-neutral-900 dark:text-white">
		Overlay
	</ColorPicker.Label>

	<ColorPicker.Area
		class="h-32 w-full rounded-md border border-neutral-200 dark:border-neutral-700"
		style="background:
			linear-gradient(to top, #000, transparent),
			linear-gradient(to right, #fff, transparent),
			var(--color-picker-hue-color);"
	>
		<ColorPicker.AreaThumb
			class="size-4 rounded-full border-2 border-white shadow-md"
			style="background: var(--color-picker-value);"
		/>
	</ColorPicker.Area>

	<ColorPicker.Slider
		channel="hue"
		class="h-3 w-full rounded-full"
		style="background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);"
	>
		<ColorPicker.SliderThumb
			class="size-4 rounded-full border-2 border-white shadow-md"
			style="background: var(--color-picker-hue-color);"
		/>
	</ColorPicker.Slider>

	<ColorPicker.Slider channel="alpha" class="h-3 w-full rounded-full" style={checkers}>
		<div
			class="pointer-events-none absolute inset-0 rounded-full"
			style="background: linear-gradient(to right, var(--color-picker-slider-start), var(--color-picker-slider-end));"
		></div>
		<ColorPicker.SliderThumb
			class="size-4 rounded-full border-2 border-white shadow-md"
			style="background: var(--color-picker-value);"
		/>
	</ColorPicker.Slider>

	<p class="font-mono text-sm text-neutral-600 dark:text-neutral-400">{value}</p>
</ColorPicker.Root>
