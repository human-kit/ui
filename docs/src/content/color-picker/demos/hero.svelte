<script lang="ts">
	import { ColorPicker } from '@human-kit/ui';

	let value = $state('#3366cc');
</script>

<ColorPicker.Root bind:value class="flex w-64 flex-col gap-3">
	<ColorPicker.Label class="text-sm font-medium text-neutral-900 dark:text-white">
		Brand color
	</ColorPicker.Label>

	<ColorPicker.Area
		class="h-40 w-full rounded-md border border-neutral-200 dark:border-neutral-700"
		style="background:
			linear-gradient(to top, #000, transparent),
			linear-gradient(to right, #fff, transparent),
			var(--color-picker-hue-color);"
	>
		<ColorPicker.AreaThumb
			class="size-4 rounded-full border-2 border-white shadow-md outline-none data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:data-[focus-visible=true]:outline-white"
			style="background: var(--color-picker-value);"
		/>
	</ColorPicker.Area>

	<div class="flex items-center gap-3">
		<ColorPicker.Preview
			class="size-9 shrink-0 rounded-md border border-neutral-200 dark:border-neutral-700"
			style="background: var(--color-picker-swatch-color);"
		/>
		<div class="flex flex-1 flex-col gap-2">
			<ColorPicker.Slider
				channel="hue"
				class="h-3 w-full rounded-full"
				style="background: linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00);"
			>
				<ColorPicker.SliderThumb
					class="size-4 rounded-full border-2 border-white shadow-md outline-none data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:data-[focus-visible=true]:outline-white"
					style="background: var(--color-picker-hue-color);"
				/>
			</ColorPicker.Slider>
			<ColorPicker.HexField
				class="w-full rounded-md border border-neutral-300 bg-white px-2 py-1 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
			/>
		</div>
	</div>
</ColorPicker.Root>
