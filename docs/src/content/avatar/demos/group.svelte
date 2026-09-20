<script lang="ts">
	import { Avatar } from '@human-kit/ui';

	const people = [
		['Ada Lovelace', '#c7d2fe', '#4338ca'],
		['Grace Hopper', '#fde68a', '#b45309'],
		['Katherine Johnson', '#bbf7d0', '#15803d'],
		['Mary Jackson', '#fecaca', '#b91c1c'],
		['Dorothy Vaughan', '#e9d5ff', '#7e22ce']
	] as const;

	// Drawn portraits, thus the demo needs no file and no person.
	function portrait(back: string, front: string) {
		return (
			'data:image/svg+xml;utf8,' +
			encodeURIComponent(
				`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="${back}"/><circle cx="40" cy="32" r="14" fill="${front}"/><path d="M12 80c0-16 12-26 28-26s28 10 28 26z" fill="${front}"/></svg>`
			)
		);
	}

	const avatarClass =
		'inline-flex size-10 items-center justify-center overflow-hidden rounded-full bg-neutral-200 ring-2 ring-white dark:bg-neutral-800 dark:ring-neutral-950';
</script>

<Avatar.Group max={3} aria-label="Assignees" class="flex -space-x-2">
	{#each people as [name, back, front] (name)}
		<Avatar.Root class={avatarClass}>
			<Avatar.Image src={portrait(back, front)} alt={name} class="size-full object-cover" />
			<Avatar.Fallback delay={600} class="text-xs font-medium">
				{name
					.split(' ')
					.map((part) => part[0])
					.join('')}
			</Avatar.Fallback>
		</Avatar.Root>
	{/each}
	<Avatar.Count class="{avatarClass} text-xs font-medium text-neutral-700 dark:text-neutral-200" />
</Avatar.Group>
