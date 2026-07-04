<script lang="ts">
	import { Popover } from '@human-kit/ui';
	import type { ExtendedPlacement } from '@human-kit/ui/primitives';

	const placements: ExtendedPlacement[] = ['top', 'bottom', 'left', 'right'];
</script>

<div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
	{#each placements as placement (placement)}
		<Popover.Root>
			<Popover.Trigger
				class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
			>
				{placement}
			</Popover.Trigger>
			<Popover.Content
				{placement}
				offset={8}
				class="rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-800"
			>
				<p class="text-sm text-gray-900 dark:text-white">Placed at <strong>{placement}</strong></p>
			</Popover.Content>
		</Popover.Root>
	{/each}
</div>
