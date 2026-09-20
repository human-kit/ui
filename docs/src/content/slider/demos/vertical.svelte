<script lang="ts">
	import { Slider } from '@human-kit/ui';

	let value = $state(0.6);
</script>

<Slider.Root
	bind:value
	min={0}
	max={1}
	step={0.05}
	orientation="vertical"
	formatOptions={{ style: 'percent' }}
	class="flex h-48 flex-col items-center gap-2"
>
	<Slider.Label class="text-sm text-neutral-900 dark:text-white">Opacity</Slider.Label>
	<Slider.Track class="w-1.5 flex-1 cursor-pointer rounded-full bg-neutral-200 dark:bg-neutral-700">
		<Slider.Fill class="w-full rounded-full bg-neutral-900 dark:bg-white" />
		<Slider.Thumb
			class="size-4 rounded-full border-2 border-neutral-900 bg-white outline-none data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-white dark:bg-neutral-900 dark:data-[focus-visible=true]:outline-white"
		/>
	</Slider.Track>
	<Slider.Output class="text-sm tabular-nums text-neutral-900 dark:text-white" />
</Slider.Root>
