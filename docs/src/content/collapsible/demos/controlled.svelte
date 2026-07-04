<script lang="ts">
	import { Collapsible } from '@human-kit/ui';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	let open = $state(false);
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<div class="flex gap-2">
		<button
			type="button"
			onclick={() => (open = true)}
			class="rounded-md bg-gray-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600"
		>
			Open
		</button>
		<button
			type="button"
			onclick={() => (open = false)}
			class="rounded-md bg-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-800 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
		>
			Close
		</button>
	</div>

	<Collapsible.Root
		bind:open
		class="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
	>
		<Collapsible.Trigger
			class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-gray-900 outline-none transition-colors hover:bg-gray-50 data-focus-visible:ring-2 data-focus-visible:ring-inset data-focus-visible:ring-blue-500 dark:text-white dark:hover:bg-gray-800"
		>
			Advanced settings
			<ChevronDown
				class="size-4 shrink-0 text-gray-500 transition-transform duration-200 group-data-open:rotate-180"
			/>
		</Collapsible.Trigger>
		<Collapsible.Panel
			class="border-t border-gray-200 px-4 py-3 text-sm leading-6 text-gray-600 dark:border-gray-700 dark:text-gray-300"
		>
			These options change how the workspace is indexed. They rarely need to be adjusted.
		</Collapsible.Panel>
	</Collapsible.Root>

	<p class="text-xs text-gray-500 dark:text-gray-400">open: {open}</p>
</div>
