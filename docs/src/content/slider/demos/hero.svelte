<script lang="ts">
	import { Slider } from '@human-kit/ui';

	let value = $state(40);
</script>

<Slider.Root bind:value class="flex w-64 flex-col gap-2">
	<div class="flex items-center justify-between text-sm text-neutral-900 dark:text-white">
		<Slider.Label>Volume</Slider.Label>
		<Slider.Output class="tabular-nums" />
	</div>
	<Slider.Track
		class="h-1.5 w-full cursor-pointer rounded-full bg-neutral-200 data-[disabled=true]:cursor-default dark:bg-neutral-700"
	>
		<Slider.Fill class="h-full rounded-full bg-neutral-900 dark:bg-white" />
		<Slider.Thumb
			class="size-4 rounded-full border-2 border-neutral-900 bg-white outline-none transition-transform data-[dragging=true]:scale-110 data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:border-white dark:bg-neutral-900 dark:data-[focus-visible=true]:outline-white"
		/>
	</Slider.Track>
</Slider.Root>
