<script lang="ts">
	import { Popover } from '@human-kit/ui';
</script>

<div class="flex flex-wrap justify-center gap-4">
	<Popover.Root>
		<Popover.Trigger
			class="rounded-lg bg-gray-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-gray-900"
		>
			Modal (default)
		</Popover.Trigger>
		<Popover.Content
			class="w-62.5 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			<h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Modal popover</h3>
			<p class="text-sm text-gray-600 dark:text-gray-300">
				Focus is trapped, scroll is locked, and outside content is hidden from assistive technology.
			</p>
		</Popover.Content>
	</Popover.Root>

	<Popover.Root>
		<Popover.Trigger
			class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
		>
			Non-modal
		</Popover.Trigger>
		<Popover.Content
			nonModal
			class="w-62.5 rounded-xl border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800"
		>
			<h3 class="mb-2 font-semibold text-gray-900 dark:text-white">Non-modal popover</h3>
			<p class="text-sm text-gray-600 dark:text-gray-300">
				You can keep interacting with the rest of the page. Closes when focus leaves it.
			</p>
		</Popover.Content>
	</Popover.Root>
</div>
