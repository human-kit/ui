<script lang="ts">
	import PipetteIcon from '@lucide/svelte/icons/pipette';
	import { ColorPicker } from '@human-kit/ui';

	let value = $state('#16a34a');

	const palette = [
		'#dc2626',
		'#ea580c',
		'#ca8a04',
		'#16a34a',
		'#0891b2',
		'#2563eb',
		'#7c3aed',
		'#db2777'
	];
</script>

<ColorPicker.Root bind:value class="flex w-64 flex-col gap-3">
	<ColorPicker.Label class="text-sm font-medium text-neutral-900 dark:text-white">
		Label color
	</ColorPicker.Label>

	<ColorPicker.SwatchList class="grid grid-cols-8 gap-1.5">
		{#each palette as color (color)}
			<ColorPicker.Swatch
				{color}
				class="size-6 cursor-pointer rounded-md outline-none data-[selected=true]:ring-2 data-[selected=true]:ring-neutral-900 data-[selected=true]:ring-offset-2 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:data-[selected=true]:ring-white dark:data-[selected=true]:ring-offset-neutral-950 dark:data-[focus-visible=true]:outline-white"
				style="background: var(--color-picker-swatch-color);"
			/>
		{/each}
	</ColorPicker.SwatchList>

	<div class="flex items-center gap-2">
		<ColorPicker.Preview
			class="size-9 shrink-0 rounded-md border border-neutral-200 dark:border-neutral-700"
			style="background: var(--color-picker-swatch-color);"
		/>
		<ColorPicker.HexField
			class="w-28 rounded-md border border-neutral-300 bg-white px-2 py-1 font-mono text-sm text-neutral-900 outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:focus:border-white"
		/>
		<ColorPicker.EyeDropper
			class="inline-flex size-9 items-center justify-center rounded-md border border-neutral-300 text-neutral-700 outline-none hover:bg-neutral-100 data-[open=true]:bg-neutral-200 data-[open=true]:text-neutral-900 data-[unsupported=true]:hidden data-[focus-visible=true]:outline-solid dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:data-[open=true]:bg-neutral-700 dark:data-[open=true]:text-white"
		>
			<PipetteIcon class="size-4" />
		</ColorPicker.EyeDropper>
	</div>
</ColorPicker.Root>
