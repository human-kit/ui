<script lang="ts">
	import { Popover } from '@human-kit/ui';

	let open = $state(false);
</script>

<Popover.Root bind:open>
	<Popover.Trigger
		class="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-neutral-900"
	>
		{open ? 'Close' : 'Open'} popover
	</Popover.Trigger>
	<Popover.Content
		class="w-70 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
	>
		<h3 class="mb-2 font-semibold text-neutral-900 dark:text-white">Popover content</h3>
		<p class="text-sm text-neutral-600 dark:text-neutral-300">
			Floating content anchored to the trigger. Press Escape or click outside to close.
		</p>
	</Popover.Content>
</Popover.Root>
