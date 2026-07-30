<script lang="ts">
	import { Popover } from '@human-kit/ui';

	let open = $state(false);
	// Controlled: a bare `bind:open` with a defined initial value freezes the popover
	// (the primitive treats it as controlled and never writes back). Sync via onOpenChange.
</script>

<Popover.Root {open} onOpenChange={(next) => (open = next)}>
	<Popover.Trigger
		class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
	>
		{open ? 'Close' : 'Open'} popover
	</Popover.Trigger>
	<Popover.Content
		class="w-70 border border-neutral-200 bg-white p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
	>
		<h3 class="mb-2 font-semibold text-neutral-900 dark:text-white">Popover content</h3>
		<p class="text-sm text-neutral-600 dark:text-neutral-300">
			Floating content anchored to the trigger. Press Escape or click outside to close.
		</p>
	</Popover.Content>
</Popover.Root>
