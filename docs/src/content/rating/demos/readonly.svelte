<script lang="ts">
	import StarIcon from '@lucide/svelte/icons/star';
	import { Rating } from '@human-kit/ui';

	const reviews = [
		{ name: 'Ada', score: 5 },
		{ name: 'Linus', score: 4.5 },
		{ name: 'Grace', score: 3 }
	];
</script>

<ul class="flex flex-col gap-3">
	{#each reviews as review (review.name)}
		<li class="flex items-center gap-3">
			<span class="w-14 text-sm text-neutral-900 dark:text-white">{review.name}</span>
			<Rating.Root
				value={review.score}
				precision={0.5}
				readonly
				getValueText={(score) => `${score} of 5 stars from ${review.name}`}
				aria-label="Score of {review.name}"
				class="flex gap-0.5"
			>
				{#each { length: 5 } as _, index (index)}
					<Rating.Item class="relative">
						<StarIcon class="size-5 text-neutral-300 dark:text-neutral-700" />
						<span
							class="absolute inset-y-0 left-0 overflow-hidden"
							style="width: calc(var(--rating-item-fill) * 100%)"
						>
							<StarIcon class="size-5 fill-amber-400 text-amber-400" />
						</span>
					</Rating.Item>
				{/each}
			</Rating.Root>
		</li>
	{/each}
</ul>
