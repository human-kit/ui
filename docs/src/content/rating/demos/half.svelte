<script lang="ts">
	import StarIcon from '@lucide/svelte/icons/star';
	import { Rating } from '@human-kit/ui';

	let value = $state(3.5);
</script>

<Rating.Root
	bind:value
	precision={0.5}
	aria-label="Quality"
	class="flex flex-col items-start gap-2 rounded-md outline-none data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-4 data-[focus-visible=true]:outline-neutral-900 dark:data-[focus-visible=true]:outline-white"
>
	<div class="flex gap-1">
		{#each { length: 5 } as _, index (index)}
			<Rating.Item class="relative cursor-pointer">
				<StarIcon class="size-7 text-neutral-300 dark:text-neutral-700" />
				<span
					class="pointer-events-none absolute inset-y-0 left-0 overflow-hidden"
					style="width: calc(var(--rating-item-fill) * 100%)"
				>
					<StarIcon class="size-7 fill-amber-400 text-amber-400" />
				</span>
			</Rating.Item>
		{/each}
	</div>
	<Rating.Output class="text-sm text-neutral-600 tabular-nums dark:text-neutral-400" />
</Rating.Root>
