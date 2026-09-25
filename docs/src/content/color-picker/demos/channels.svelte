<script lang="ts">
	import { ColorPicker } from '@human-kit/ui';

	let value = $state('#7c3aed');

	const field =
		'w-16 rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm text-neutral-900' +
		' outline-none focus:border-neutral-900 dark:border-neutral-700 dark:bg-neutral-900' +
		' dark:text-white dark:focus:border-white';
</script>

<ColorPicker.Root bind:value class="flex flex-col gap-3">
	<ColorPicker.Label class="text-sm font-medium text-neutral-900 dark:text-white">
		Exact color
	</ColorPicker.Label>

	<div class="flex items-end gap-2">
		<ColorPicker.Preview
			class="size-9 rounded-md border border-neutral-200 dark:border-neutral-700"
			style="background: var(--color-picker-swatch-color);"
		/>
		<label class="flex flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-400">
			Red
			<ColorPicker.ChannelField channel="red" class={field} />
		</label>
		<label class="flex flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-400">
			Green
			<ColorPicker.ChannelField channel="green" class={field} />
		</label>
		<label class="flex flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-400">
			Blue
			<ColorPicker.ChannelField channel="blue" class={field} />
		</label>
		<label class="flex flex-col gap-1 text-xs text-neutral-600 dark:text-neutral-400">
			Hex
			<ColorPicker.HexField class="{field} w-24 font-mono" />
		</label>
	</div>
</ColorPicker.Root>
