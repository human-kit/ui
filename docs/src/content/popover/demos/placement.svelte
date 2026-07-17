<script lang="ts">
	import { Popover } from '@human-kit/ui';
	import type { ExtendedPlacement } from '@human-kit/ui/primitives';

	const placements: ExtendedPlacement[] = ['top', 'bottom', 'left', 'right'];
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
	{#each placements as placement (placement)}
		<Popover.Root>
			<Popover.Trigger
				class="inline-flex h-8 w-full items-center justify-center rounded-md border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
			>
				{placement}
			</Popover.Trigger>
			<Popover.Content
				{placement}
				offset={8}
				class="rounded-lg border border-neutral-200 bg-white p-3 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
			>
				<p class="text-sm text-neutral-900 dark:text-white">
					Placed at <strong>{placement}</strong>
				</p>
			</Popover.Content>
		</Popover.Root>
	{/each}
</div>
