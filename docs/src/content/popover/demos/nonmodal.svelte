<script lang="ts">
	import { Popover } from '@human-kit/svelte-components';
</script>

<div class="flex flex-wrap justify-center gap-4">
	<Popover.Root>
		<Popover.Trigger
			class="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white transition-colors hover:bg-black dark:bg-white dark:text-neutral-900"
		>
			Modal (default)
		</Popover.Trigger>
		<Popover.Content
			class="w-62.5 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
		>
			<h3 class="mb-2 font-semibold text-neutral-900 dark:text-white">Modal popover</h3>
			<p class="text-sm text-neutral-600 dark:text-neutral-300">
				Focus is trapped, scroll is locked, and outside content is hidden from assistive technology.
			</p>
		</Popover.Content>
	</Popover.Root>

	<Popover.Root>
		<Popover.Trigger
			class="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 transition-colors hover:bg-neutral-50 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
		>
			Non-modal
		</Popover.Trigger>
		<Popover.Content
			nonModal
			class="w-62.5 rounded-xl border border-neutral-200 bg-white p-4 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
		>
			<h3 class="mb-2 font-semibold text-neutral-900 dark:text-white">Non-modal popover</h3>
			<p class="text-sm text-neutral-600 dark:text-neutral-300">
				You can keep interacting with the rest of the page. Closes when focus leaves it.
			</p>
		</Popover.Content>
	</Popover.Root>
</div>
