<script lang="ts">
	import { Collapsible } from '@human-kit/ui';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
</script>

<Collapsible.Root
	defaultOpen
	class="w-full max-w-md overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
>
	<Collapsible.Trigger
		class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-gray-900 outline-none transition-colors hover:bg-gray-50 data-focus-visible:ring-2 data-focus-visible:ring-inset data-focus-visible:ring-blue-500 dark:text-white dark:hover:bg-gray-800"
	>
		Recovery keys
		<ChevronDown
			class="size-4 shrink-0 text-gray-500 transition-transform duration-200 group-data-open:rotate-180"
		/>
	</Collapsible.Trigger>
	<Collapsible.Panel
		class="border-t border-gray-200 px-4 py-3 text-sm leading-6 text-gray-600 dark:border-gray-700 dark:text-gray-300"
	>
		Store these one-time recovery keys somewhere safe. Each key can be used a single time to regain
		access if you lose your authenticator.
	</Collapsible.Panel>
</Collapsible.Root>
