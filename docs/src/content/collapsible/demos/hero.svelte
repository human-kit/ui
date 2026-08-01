<script lang="ts">
	import { Collapsible } from '@human-kit/ui';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
</script>

<Collapsible.Root
	defaultOpen
	class="w-full max-w-md overflow-hidden border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
>
	<Collapsible.Trigger
		class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-neutral-900 outline-none transition-colors hover:bg-neutral-50 data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:data-focus-visible:outline-white"
	>
		Recovery keys
		<ChevronDown
			class="size-4 shrink-0 text-neutral-500 transition-transform duration-200 group-data-open:rotate-180"
		/>
	</Collapsible.Trigger>
	<Collapsible.Panel
		class="border-t border-neutral-200 px-4 py-3 text-sm leading-6 text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
	>
		Store these one-time recovery keys somewhere safe. Each key can be used a single time to regain
		access if you lose your authenticator.
	</Collapsible.Panel>
</Collapsible.Root>
