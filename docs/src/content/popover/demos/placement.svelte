<script lang="ts">
	import { Popover } from '@human-kit/ui';
	import type { ExtendedPlacement } from '@human-kit/ui/primitives';

	const placements: ExtendedPlacement[] = ['top', 'bottom', 'left', 'right'];
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
	{#each placements as placement (placement)}
		<Popover.Root>
			<Popover.Trigger
				class="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-900 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
			>
				{placement}
			</Popover.Trigger>
			<Popover.Content
				{placement}
				offset={8}
				class="rounded-lg border border-neutral-200 bg-white p-3 shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
			>
				<p class="text-sm text-neutral-900 dark:text-white">
					Placed at <strong>{placement}</strong>
				</p>
			</Popover.Content>
		</Popover.Root>
	{/each}
</div>
