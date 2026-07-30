<script lang="ts">
	import { Popover } from '@human-kit/ui';
</script>

<div class="flex flex-wrap justify-center gap-4">
	<Popover.Root>
		<Popover.Trigger
			class="inline-flex h-8 items-center justify-center gap-2 bg-black px-3 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200 dark:focus-visible:outline-white"
		>
			Modal (default)
		</Popover.Trigger>
		<Popover.Content
			class="w-62.5 border border-neutral-200 bg-white p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			<h3 class="mb-2 font-semibold text-neutral-900 dark:text-white">Modal popover</h3>
			<p class="text-sm text-neutral-600 dark:text-neutral-300">
				Focus is trapped, scroll is locked, and outside content is hidden from assistive technology.
			</p>
		</Popover.Content>
	</Popover.Root>

	<Popover.Root>
		<Popover.Trigger
			class="inline-flex h-8 items-center justify-center border border-neutral-300 bg-white px-3 text-sm text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800 dark:focus-visible:outline-white"
		>
			Non-modal
		</Popover.Trigger>
		<Popover.Content
			nonModal
			class="w-62.5 border border-neutral-200 bg-white p-4 shadow-md dark:border-neutral-800 dark:bg-neutral-900"
		>
			<h3 class="mb-2 font-semibold text-neutral-900 dark:text-white">Non-modal popover</h3>
			<p class="text-sm text-neutral-600 dark:text-neutral-300">
				You can keep interacting with the rest of the page. Closes when focus leaves it.
			</p>
		</Popover.Content>
	</Popover.Root>
</div>
