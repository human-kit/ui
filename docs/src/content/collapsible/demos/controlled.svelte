<script lang="ts">
	import { Collapsible } from '@human-kit/ui';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';

	let open = $state(false);
	// Controlled: `bind:open` with a defined initial value freezes the trigger — the
	// primitive treats it as controlled and never writes back, so only the external
	// buttons worked. onOpenChange syncs the trigger's own toggle too.
</script>

<div class="flex w-full max-w-md flex-col gap-4">
	<div class="flex gap-2">
		<button
			type="button"
			onclick={() => (open = true)}
			class="rounded-md bg-neutral-900 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-neutral-700 dark:bg-neutral-700 dark:hover:bg-neutral-600"
		>
			Open
		</button>
		<button
			type="button"
			onclick={() => (open = false)}
			class="rounded-md bg-neutral-200 px-2.5 py-1.5 text-xs font-medium text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
		>
			Close
		</button>
	</div>

	<Collapsible.Root
		{open}
		onOpenChange={(next) => (open = next)}
		class="overflow-hidden rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900"
	>
		<Collapsible.Trigger
			class="group flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-neutral-900 outline-none transition-colors hover:bg-neutral-50 data-focus-visible:outline-2 data-focus-visible:-outline-offset-2 data-focus-visible:outline-neutral-900 dark:text-white dark:hover:bg-neutral-800 dark:data-focus-visible:outline-white"
		>
			Advanced settings
			<ChevronDown
				class="size-4 shrink-0 text-neutral-500 transition-transform duration-200 group-data-open:rotate-180"
			/>
		</Collapsible.Trigger>
		<Collapsible.Panel
			class="border-t border-neutral-200 px-4 py-3 text-sm leading-6 text-neutral-600 dark:border-neutral-800 dark:text-neutral-300"
		>
			These options change how the workspace is indexed. They rarely need to be adjusted.
		</Collapsible.Panel>
	</Collapsible.Root>

	<p class="text-xs text-neutral-500 dark:text-neutral-400">open: {open}</p>
</div>
