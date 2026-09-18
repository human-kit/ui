<script lang="ts">
	import { Slider } from '@human-kit/ui';

	let value = $state([200, 650]);
</script>

<Slider.Root
	bind:value
	min={0}
	max={1000}
	step={10}
	minStepsBetweenThumbs={5}
	formatOptions={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
	class="flex w-64 flex-col gap-2"
>
	<div class="flex items-center justify-between text-sm text-neutral-900 dark:text-white">
		<Slider.Label>Price</Slider.Label>
		<Slider.Output class="tabular-nums" />
	</div>
	<Slider.Track class="h-1.5 w-full cursor-pointer rounded-full bg-neutral-200 dark:bg-neutral-700">
		<Slider.Fill class="h-full bg-neutral-900 dark:bg-white" />
		<Slider.Thumb
			class="size-4 rounded-full border-2 border-neutral-900 bg-white outline-none data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-white dark:bg-neutral-900 dark:data-[focus-visible=true]:outline-white"
		/>
		<Slider.Thumb
			class="size-4 rounded-full border-2 border-neutral-900 bg-white outline-none data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-white dark:bg-neutral-900 dark:data-[focus-visible=true]:outline-white"
		/>
	</Slider.Track>
</Slider.Root>
