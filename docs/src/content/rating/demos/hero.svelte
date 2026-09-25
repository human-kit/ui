<script lang="ts">
	import StarIcon from '@lucide/svelte/icons/star';
	import { Rating } from '@human-kit/ui';

	let value = $state(3);
</script>

<Rating.Root bind:value class="flex flex-col items-start gap-2">
	<div class="flex items-center gap-3 text-sm text-neutral-900 dark:text-white">
		<Rating.Label>Quality</Rating.Label>
		<Rating.Output class="text-neutral-600 tabular-nums dark:text-neutral-400" />
	</div>
	<div class="flex gap-1">
		{#each { length: 5 } as _, index (index)}
			<Rating.Item
				class="relative cursor-pointer rounded-sm outline-none data-[disabled=true]:cursor-default data-[focus-visible=true]:outline-solid data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-offset-2 data-[focus-visible=true]:outline-neutral-900 dark:data-[focus-visible=true]:outline-white"
			>
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
</Rating.Root>
